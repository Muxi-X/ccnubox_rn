import * as React from 'react';

import { useClassroomStarStore } from '@/store/classroom';
import useTimeStore from '@/store/time';

import {
  ClassroomColumns,
  getCurrentDayOfWeek,
  getCurrentTimeSlot,
  getSelectedPeriods,
  type PickerColumnItem,
  type PickerColumns,
} from '@/modules/mainPage/components/classroom';
import {
  getClassroomList,
  queryFreeClassroom,
} from '@/request/api/queryClassroom';

const LOCATION_LABELS: Record<string, string> = {
  n: '南湖综合楼',
  '3': '3号楼',
  '7': '7号楼',
  '8': '8号楼',
  '9': '9号楼',
  '10': '10号楼',
};

const parseRoomBuilding = (
  room: string
): { building: string; floor: string } | null => {
  let building: string;
  let rest: string;

  if (room.startsWith('n')) {
    building = 'n';
    rest = room.slice(1);
  } else if (room.startsWith('10')) {
    building = '10';
    rest = room.slice(2);
  } else if (room.length >= 1) {
    building = room[0];
    rest = room.slice(1);
  } else {
    return null;
  }

  if (rest.length === 0) return null;
  return { building, floor: rest[0] };
};

const buildDynamicData = (
  rooms: string[]
): {
  locationColumn: PickerColumnItem[];
  buildingFloors: Record<string, string[]>;
} => {
  const floorMap: Record<string, Set<string>> = {};

  for (const room of rooms) {
    const parsed = parseRoomBuilding(room);
    if (!parsed) continue;
    if (!floorMap[parsed.building]) floorMap[parsed.building] = new Set();
    floorMap[parsed.building].add(parsed.floor);
  }

  const locationColumn = Object.keys(floorMap)
    .sort((a, b) => {
      if (a === 'n') return -1;
      if (b === 'n') return 1;
      return parseInt(a) - parseInt(b);
    })
    .map(loc => ({ label: LOCATION_LABELS[loc] ?? `${loc}号楼`, value: loc }));

  const buildingFloors: Record<string, string[]> = {};
  for (const [building, floors] of Object.entries(floorMap)) {
    buildingFloors[building] = [...floors].sort(
      (a, b) => parseInt(a) - parseInt(b)
    );
  }

  return { locationColumn, buildingFloors };
};

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

export interface ClassroomStatus {
  roomNumber: string;
  status: {
    period: number;
    status: 'outTime' | 'free' | 'occupied';
  }[];
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

  const [locationOptions, setLocationOptions] = React.useState<
    PickerColumnItem[]
  >(ClassroomColumns[0]);
  const [buildingFloors, setBuildingFloors] = React.useState<
    Record<string, string[]>
  >({});

  const [selectedValues, setSelectedValues] = React.useState<string[]>([
    'n',
    '1',
    currentTimeSlot,
  ]);
  const [inPickerValues, setInPickerValues] = React.useState<string[]>([
    'n',
    '1',
    currentTimeSlot,
  ]);

  const pickerColumns = React.useMemo<PickerColumns>(() => {
    const floors = buildingFloors[inPickerValues[0]];
    const floorColumn = floors
      ? floors.map(f => ({ label: `${f}层`, value: f }))
      : ClassroomColumns[1];
    return [locationOptions, floorColumn, ClassroomColumns[2]];
  }, [locationOptions, buildingFloors, inPickerValues[0]]);

  const selectedLabels = React.useMemo(() => {
    const buildingLabel =
      locationOptions.find(l => l.value === selectedValues[0])?.label ??
      selectedValues[0];
    return [buildingLabel, `${selectedValues[1]}层`, selectedValues[2]];
  }, [selectedValues, locationOptions]);
  const [classroomData, setClassroomData] = React.useState<ClassroomStatus[]>(
    []
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const requestIdRef = React.useRef(0);

  React.useEffect(() => {
    getClassroomList()
      .then(rooms => {
        if (rooms.length === 0) return;
        const { locationColumn, buildingFloors: floors } =
          buildDynamicData(rooms);
        setLocationOptions(locationColumn);
        setBuildingFloors(floors);
        const firstBuilding = locationColumn[0].value;
        const firstFloor = floors[firstBuilding]?.[0] ?? '1';
        setSelectedValues([firstBuilding, firstFloor, currentTimeSlot]);
        setInPickerValues([firstBuilding, firstFloor, currentTimeSlot]);
      })
      .catch(() => {
        // 拉取失败保持硬编码默认值
      });
  }, []);

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

  const handlePickerConfirm = (_result: string[]) => {
    setSelectedValues([...inPickerValues]);
  };

  const handlePickerCancel = () => {
    setInPickerValues([...selectedValues]);
  };

  const fetchClassroomData = async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError('');

    try {
      const [locationValue, floorValue, timeSlot] = selectedValues;
      const wherePrefix = locationValue + floorValue;
      const sections = getSelectedPeriods(timeSlot);

      const queryParams = {
        year: formatAcademicYear(storeYear),
        semester: storeSemester,
        week: currentWeek,
        day: currentDayOfWeek,
        sections: sections,
        wherePrefix: wherePrefix,
      };

      const response: ClassroomResponse = await queryFreeClassroom(queryParams);

      if (requestId !== requestIdRef.current) return;

      if (response && response.data && response.data.stat) {
        const convertedData: ClassroomStatus[] = response.data.stat.map(
          (item: ClassroomClassroomAvailableStat) => ({
            roomNumber: item.classroom || '',
            status: item.availableStat
              ? item.availableStat.map(
                  (isAvailable: boolean, index: number) => ({
                    period: sections[index] || index + 1,
                    status: isAvailable ? 'free' : 'occupied',
                  })
                )
              : [],
          })
        );

        setClassroomData(convertedData);
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
  }, [selectedValues, currentWeek, currentDayOfWeek]);

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
