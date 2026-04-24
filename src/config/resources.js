export const RESOURCE_CONFIG = {
  teachers: {
    endpoint: "/teachers",
    title: "Teachers",
    subtitle: "Faculty directory and RFID assignments",
    primaryKey: "teacherid",
    columns: ["teacherid", "teachercode", "rfid", "lastname", "firstname", "deptid"],
    formFields: [
      { name: "teachercode", label: "Teacher Code", placeholder: "1004" },
      { name: "rfid", label: "RFID", placeholder: "998877" },
      { name: "lastname", label: "Last Name", placeholder: "Garcia" },
      { name: "firstname", label: "First Name", placeholder: "Ana" },
      { name: "deptid", label: "Dept ID", type: "number", min: "1", step: "1", placeholder: "2" }
    ]
  },
  students: {
    endpoint: "/students",
    title: "Students",
    subtitle: "Student master list",
    primaryKey: "idno",
    columns: ["idno", "lastname", "firstname", "course_code", "course_descr", "level"],
    formFields: [
      { name: "idno", label: "ID Number", placeholder: "1005" },
      { name: "lastname", label: "Last Name", placeholder: "Reyes" },
      { name: "firstname", label: "First Name", placeholder: "Juan" },
      { name: "course_id", label: "Course Code", type: "resource-select", resource: "course", valueKey: "course_id", labelKey: "course_code", placeholder: "1" },
      { name: "level", label: "Level", type: "select", options: ["1", "2", "3", "4"], placeholder: "1" }
    ]
  },
  subjects: {
    endpoint: "/subjects",
    title: "Subjects",
    subtitle: "Subject catalog",
    primaryKey: "subjid",
    columns: ["subjid", "subjcode", "subjdesc", "units"],
    formFields: [
      { name: "subjcode", label: "Subject Code", placeholder: "IT-DBSYS" },
      { name: "subjdesc", label: "Description", placeholder: "Database Systems" },
      { name: "units", label: "Units", type: "number", min: "1", max: "6", step: "0.5", placeholder: "3" }
    ]
  },
  subjectoffered: {
    endpoint: "/subjectoffered",
    title: "Subject Offered",
    subtitle: "EDP codes and scheduling",
    primaryKey: "suboffid",
    columns: ["suboffid", "edpcode", "subjcode", "subjdesc", "days", "start_time", "end_time", "room", "teacher_name"],
    formFields: [
      { name: "edpcode", label: "EDP Code", placeholder: "ec2000" },
      { name: "subjid", label: "Subject", type: "resource-select", resource: "subjects", valueKey: "subjid", labelKey: "subjcode", placeholder: "2" },
      { name: "start_time", label: "Start Time", type: "time", placeholder: "7:30" },
      { name: "end_time", label: "End Time", type: "time", placeholder: "9:00" },
      { name: "days", label: "Days", type: "select", options: ["mon", "tth", "mwf", "fri"], placeholder: "mwf" },
      { name: "room", label: "Room", placeholder: "526" },
      { name: "teacherid", label: "Teacher", type: "resource-select", resource: "teachers", valueKey: "teacherid", labelKey: "lastname", secondaryLabelKey: "firstname", placeholder: "1" }
    ]
  },
  course: {
    endpoint: "/course",
    title: "Course",
    subtitle: "Course reference list",
    primaryKey: "course_id",
    columns: ["course_id", "course_code", "course_desc"],
    formFields: [
      { name: "course_code", label: "Course Code", placeholder: "BSIS" },
      { name: "course_desc", label: "Description", placeholder: "Bachelor of Science in Information Systems" }
    ]
  },
  enrollment: {
    endpoint: "/enrollment",
    title: "Enrollment",
    subtitle: "Enrollment headers",
    primaryKey: "enroll_id",
    columns: ["enroll_id", "enroll_code", "enroll_date", "idno", "lastname", "firstname", "status", "amt_paid"],
    formFields: [
      { name: "enroll_code", label: "Enroll Code", placeholder: "ENR1001" },
      { name: "enroll_date", label: "Enroll Date", type: "date", placeholder: "2026-04-17" },
      { name: "student_id", label: "Student", type: "resource-select", resource: "students", valueKey: "id", labelKey: "idno", secondaryLabelKey: "lastname", tertiaryLabelKey: "firstname", placeholder: "1" },
      { name: "status", label: "Status", type: "select", options: ["enrolled", "pending", "cancelled"], placeholder: "enrolled" },
      { name: "amt_paid", label: "Amount Paid", type: "number", min: "0", step: "0.01", placeholder: "1500" }
    ]
  },
  enrollment_details: {
    endpoint: "/enrollment_details",
    title: "Enrollment Details",
    subtitle: "Subjects taken per enrollment",
    primaryKey: "enroll_detail_id",
    columns: ["enroll_detail_id", "enroll_code", "edpcode", "subjcode", "subjdesc"],
    formFields: [
      { name: "enroll_id", label: "Enrollment", type: "resource-select", resource: "enrollment", valueKey: "enroll_id", labelKey: "enroll_code", placeholder: "1" },
      { name: "suboffid", label: "Subject Offered", type: "resource-select", resource: "subjectoffered", valueKey: "suboffid", labelKey: "edpcode", secondaryLabelKey: "subjcode", placeholder: "1" }
    ]
  },
  enrollment_list: {
    endpoint: "/enrollment",
    title: "Enrollment List",
    subtitle: "Enrollment headers table view",
    primaryKey: "enroll_id",
    columns: ["enroll_code", "name", "course_level", "enroll_date"],
    formFields: []
  }
};

export const RESOURCE_ENTRIES = Object.entries(RESOURCE_CONFIG);

export const EMPTY_FORM = Object.keys(RESOURCE_CONFIG).reduce((result, key) => {
  result[key] = RESOURCE_CONFIG[key].formFields.reduce((fieldState, field) => {
    fieldState[field.name] = "";
    return fieldState;
  }, {});

  return result;
}, {});
