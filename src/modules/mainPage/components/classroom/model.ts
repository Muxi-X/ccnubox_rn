export const prefix = ['自习地点', '楼层', '时间'];

const TIME_SLOT_COLUMN = [
  { label: '上午', value: '上午' },
  { label: '下午', value: '下午' },
  { label: '晚上', value: '晚上' },
];

export const ClassroomColumns = [[], [], TIME_SLOT_COLUMN];

export type PickerColumnItem = { label: string; value: string };
export type PickerColumns = PickerColumnItem[][];

export interface ClassroomPickerData {
  locationColumn: PickerColumnItem[];
  buildingFloors: Record<string, string[]>;
}

const parseClassroomLocation = (
  classroom: string
): { building: string; floor: string } | null => {
  const match = classroom.trim().match(/^(10|[A-Za-z]|\d)(\d)/);
  if (!match) return null;

  return { building: match[1], floor: match[2] };
};

export const getClassroomWherePrefix = (classroom: string): string | null => {
  const location = parseClassroomLocation(classroom);
  return location?.building ?? null;
};

const getBuildingLabel = (building: string): string =>
  building === 'n' ? '南湖综合楼' : `${building.toUpperCase()}号楼`;

export const buildClassroomPickerData = (
  classrooms: string[]
): ClassroomPickerData => {
  const floorMap = new Map<string, Set<string>>();

  for (const classroom of classrooms) {
    const location = parseClassroomLocation(classroom);
    if (!location) continue;

    const { building, floor } = location;
    const floors = floorMap.get(building) ?? new Set<string>();
    floors.add(floor);
    floorMap.set(building, floors);
  }

  const locationColumn = [...floorMap.keys()].map(building => ({
    label: getBuildingLabel(building),
    value: building,
  }));
  const buildingFloors = Object.fromEntries(
    [...floorMap].map(([building, floors]) => [
      building,
      [...floors].sort((a, b) => Number(a) - Number(b)),
    ])
  );

  return { locationColumn, buildingFloors };
};

export interface ClassroomStatus {
  roomNumber: string;
  status: {
    period: number;
    status: 'outTime' | 'free' | 'occupied';
  }[];
}

export const getCurrentTimeSlot = (): '上午' | '下午' | '晚上' => {
  const currentHour = new Date().getHours();

  if (currentHour < 12) return '上午';
  if (currentHour < 18) return '下午';
  return '晚上';
};

export const getCurrentDayOfWeek = (): number => {
  const dayOfWeek = new Date().getDay();
  return dayOfWeek === 0 ? 7 : dayOfWeek;
};

export const getClassPeriods = (timeSlot: string) => {
  switch (timeSlot) {
    case '上午':
      return ['1节', '2节', '3节', '4节'];
    case '下午':
      return ['5节', '6节', '7节', '8节'];
    case '晚上':
      return ['9节', '10节', '11节', '12节'];
    default:
      return [];
  }
};

export const getSelectedPeriods = (timeSlot: string) => {
  switch (timeSlot) {
    case '上午':
      return [1, 2, 3, 4];
    case '下午':
      return [5, 6, 7, 8];
    case '晚上':
      return [9, 10, 11, 12];
    default:
      return [];
  }
};

export const getCurrentPeriod = (): number => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const periods = [
    { period: 1, start: 0, end: 8 * 60 + 45 },
    { period: 2, start: 8 * 60 + 45, end: 9 * 60 + 40 },
    { period: 3, start: 9 * 60 + 40, end: 10 * 60 + 55 },
    { period: 4, start: 10 * 60 + 55, end: 11 * 60 + 50 },
    { period: 5, start: 11 * 60 + 50, end: 14 * 60 + 45 },
    { period: 6, start: 14 * 60 + 45, end: 15 * 60 + 40 },
    { period: 7, start: 15 * 60 + 40, end: 16 * 60 + 55 },
    { period: 8, start: 16 * 60 + 55, end: 17 * 60 + 50 },
    { period: 9, start: 17 * 60 + 50, end: 19 * 60 + 15 },
    { period: 10, start: 19 * 60 + 15, end: 20 * 60 + 5 },
    { period: 11, start: 20 * 60 + 5, end: 21 * 60 },
    { period: 12, start: 21 * 60, end: 21 * 60 + 50 },
  ];

  for (const periodInfo of periods) {
    if (currentTime >= periodInfo.start && currentTime < periodInfo.end) {
      return periodInfo.period;
    }
  }

  return 13;
};
