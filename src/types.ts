export interface HeadCountEntry {
  _id: null;
  totalStudents: number;
  boys: number;
  girls: number;
  others: number;
  inactiveStudents: number;
  inactiveBoys: number;
  inactiveGirls: number;
  inactiveOthers: number;
  dormantStudents: number;
  appStudents: number;
  incorrectMobileStudents: number;
  newAdmission: number;
}

export interface CourseEntry {
  total: number;
  newAdmission: number;
  awakeStudents: number;
  dormantStudents: number;
  course: string;
}

export interface SocialCategoryEntry {
  count: number;
  socialCategory: string | null;
}

export interface ReligionEntry {
  count: number;
  religion: string | null;
}

export interface BirthdayStudent {
  _id: string;
  name: string;
  dob: string;
  stream: string;
  course: string;
  gender: string;
  batch: string;
  section: string;
  photo: string;
}

export interface InactiveReason {
  count: number;
  remark: string;
}

export interface AwakeDormantEntry {
  _id: null;
  awakeStudents: number;
  dormantStudents: number;
  todayActivations: number;
}

export interface DashboardData {
  headCount: {
    currentSession: HeadCountEntry[];
    previousSession: HeadCountEntry[];
  };
  groupBySocialCategory: SocialCategoryEntry[];
  groupByReligion: ReligionEntry[];
  groupByCourse: CourseEntry[];
  birthDayStudents: BirthdayStudent[];
  inactiveReason: InactiveReason[];
  awakeDormantCount: AwakeDormantEntry[];
  unresolvedODPayQueries: number;
}

export interface EntityConfig {
  id: string;
  name: string;
  session: string;
  logo?: string;
}

export interface EntityDashboard {
  entity: EntityConfig;
  data: DashboardData | null;
  error: string | null;
  loading: boolean;
}
