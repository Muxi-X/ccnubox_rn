import * as React from 'react';

import {
  buildClassroomPickerData,
  ClassroomColumns,
  type ClassroomStatus,
  getCurrentDayOfWeek,
  getCurrentTimeSlot,
  getClassroomWherePrefix,
  getSelectedPeriods,
  type PickerColumnItem,
  type PickerColumns,
} from '@/modules/mainPage/components/classroom/model';
import {
  getClassroomList,
  queryFreeClassroom,
} from '@/request/api/queryClassroom';
import { useClassroomStarStore } from '@/store/classroom';
import useTimeStore from '@/store/time';

const formatAcademicYear = (year: string): string =>
  year ? `${year}-${parseInt(year, 10) + 1}` : '';

export interface ClassroomClassroomAvailableStat {
  availableStat?: boolean[];
  classroom?: string;
}

export interface ClassroomGetFreeClassRoomResp {
  stat?: ClassroomClassroomAvailableStat[];
}

export interface ClassroomResponse {
  code?: number;
  data?: ClassroomGetFreeClassRoomResp;
  msg?: string;
}

const useClassroomData = (filterStarred: boolean = false) => {
  const { starredClassrooms, isClassroomStarred, toggleStarredClassroom } =
    useClassroomStarStore();
  const getCurrentWeek = useTimeStore(state => state.getCurrentWeek);
  const storeYear = useTimeStore(state => state.year);
  const storeSemester = useTimeStore(state => state.semester);
  const currentWeek = getCurrentWeek();
  const currentDayOfWeek = getCurrentDayOfWeek();
  const currentTimeSlot = getCurrentTimeSlot();
  const starredClassroomsKey = filterStarred
    ? starredClassrooms.join('\u0000')
    : '';

  const [locationOptions, setLocationOptions] = React.useState<
    PickerColumnItem[]
  >([]);
  const [buildingFloors, setBuildingFloors] = React.useState<
    Record<string, string[]>
  >({});
  const [pickerLoading, setPickerLoading] = React.useState(true);
  const [pickerError, setPickerError] = React.useState('');

  const [selectedValues, setSelectedValues] = React.useState<string[]>([
    '',
    '',
    currentTimeSlot,
  ]);
  const [inPickerValues, setInPickerValues] = React.useState<string[]>([
    '',
    '',
    currentTimeSlot,
  ]);

  const pickerColumns = React.useMemo<PickerColumns>(() => {
    const floors = buildingFloors[inPickerValues[0]];
    const floorColumn = floors
      ? floors.map(f => ({ label: `${f}层`, value: f }))
      : [];
    return [locationOptions, floorColumn, ClassroomColumns[2]];
  }, [locationOptions, buildingFloors, inPickerValues[0]]);

  const selectedLabels = React.useMemo(() => {
    const buildingLabel =
      locationOptions.find(l => l.value === selectedValues[0])?.label ??
      selectedValues[0];
    const floorLabel = selectedValues[1] ? `${selectedValues[1]}层` : '';
    return [buildingLabel, floorLabel, selectedValues[2]];
  }, [selectedValues, locationOptions]);
  const [classroomData, setClassroomData] = React.useState<ClassroomStatus[]>(
    []
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const requestIdRef = React.useRef(0);

  React.useEffect(() => {
    if (filterStarred) {
      setPickerLoading(false);
      return;
    }

    let active = true;

    getClassroomList()
      .then(rooms => {
        if (!active) return;

        const { locationColumn, buildingFloors: floors } =
          buildClassroomPickerData(rooms);
        if (locationColumn.length === 0) {
          throw new Error('教室列表为空');
        }

        setLocationOptions(locationColumn);
        setBuildingFloors(floors);
        const firstBuilding = locationColumn[0].value;
        const firstFloor = floors[firstBuilding][0];
        setSelectedValues([firstBuilding, firstFloor, currentTimeSlot]);
        setInPickerValues([firstBuilding, firstFloor, currentTimeSlot]);
        setPickerError('');
      })
      .catch(() => {
        if (!active) return;
        setPickerError('教室列表加载失败，请稍后重试');
      })
      .finally(() => {
        if (active) setPickerLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filterStarred]);

  const handleColumnChange = (
    values: (string | number)[],
    changedIndex: number
  ) => {
    const building = String(values[0]);
    const floor = String(values[1]);
    const time = String(values[2]);

    if (changedIndex === 0) {
      const availableFloors = buildingFloors[building] ?? [];
      const newFloor = availableFloors[0] ?? floor;
      setInPickerValues([building, newFloor, time]);
    } else {
      setInPickerValues([building, floor, time]);
    }
  };

  const handlePickerConfirm = (result: string[]) => {
    setSelectedValues([...result]);
    setInPickerValues([...result]);
  };

  const handlePickerCancel = () => {
    setInPickerValues([...selectedValues]);
  };

  const fetchClassroomData = async () => {
    const requestId = ++requestIdRef.current;

    if (filterStarred && starredClassrooms.length === 0) {
      setClassroomData([]);
      setLoading(false);
      setError('');
      return;
    }

    if (!filterStarred && (!selectedValues[0] || !selectedValues[1])) return;

    setLoading(true);
    setError('');

    try {
      const [locationValue, floorValue, timeSlot] = selectedValues;
      const sections = getSelectedPeriods(timeSlot);
      const wherePrefixes = filterStarred
        ? [
            ...new Set(
              starredClassrooms
                .map(getClassroomWherePrefix)
                .filter((prefix): prefix is string => prefix !== null)
            ),
          ]
        : [locationValue + floorValue];

      if (wherePrefixes.length === 0) {
        setClassroomData([]);
        setError('');
        return;
      }

      const responses: ClassroomResponse[] = await Promise.all(
        wherePrefixes.map(wherePrefix =>
          queryFreeClassroom({
            year: formatAcademicYear(storeYear),
            semester: storeSemester,
            week: currentWeek,
            day: currentDayOfWeek,
            sections,
            wherePrefix,
          })
        )
      );

      if (requestId !== requestIdRef.current) return;

      const stats = responses.flatMap(response => response.data?.stat ?? []);
      if (responses.length > 0 && responses.every(response => response.data)) {
        const convertedData: ClassroomStatus[] = stats.map(item => ({
          roomNumber: item.classroom || '',
          status: item.availableStat
            ? item.availableStat.map((isAvailable: boolean, index: number) => ({
                period: sections[index] || index + 1,
                status: isAvailable ? 'free' : 'occupied',
              }))
            : [],
        }));

        const starredOrder = new Map(
          starredClassrooms.map((roomNumber, index) => [roomNumber, index])
        );
        setClassroomData(
          filterStarred
            ? convertedData
                .filter(classroom => starredOrder.has(classroom.roomNumber))
                .sort(
                  (a, b) =>
                    starredOrder.get(a.roomNumber)! -
                    starredOrder.get(b.roomNumber)!
                )
            : convertedData
        );
        setError('');
      } else {
        setClassroomData([]);
        setError(
          '由于假期等原因，空闲教室不可查询，具体信息请查询学校通知，敬请见谅~'
        );
      }
    } catch {
      if (requestId !== requestIdRef.current) return;
      setClassroomData([]);
      setError(
        '由于假期等原因，空闲教室不可查询，具体信息请查询学校通知，敬请见谅~'
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  React.useEffect(() => {
    fetchClassroomData();
  }, [
    selectedValues,
    currentWeek,
    currentDayOfWeek,
    filterStarred,
    starredClassroomsKey,
  ]);

  const filteredClassroomData = React.useMemo(
    () =>
      filterStarred
        ? classroomData.filter(classroom =>
            starredClassrooms.includes(classroom.roomNumber)
          )
        : classroomData,
    [classroomData, filterStarred, starredClassrooms]
  );

  return {
    selectedValues,
    selectedLabels,
    inPickerValues,
    pickerColumns,
    pickerLoading,
    pickerError,
    classroomData: filteredClassroomData,
    loading,
    error,
    starredClassrooms,
    isClassroomStarred,
    toggleStarredClassroom,
    handleColumnChange,
    handlePickerConfirm,
    handlePickerCancel,
  };
};

export default useClassroomData;
