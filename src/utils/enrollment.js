export function getNextEnrollmentCode(enrollments = []) {
  const highestNumber = enrollments.reduce((highest, record) => {
    const matchedDigits = String(record.enroll_code || "").match(/(\d+)/);
    const numericValue = matchedDigits ? Number(matchedDigits[1]) : 0;
    return Number.isFinite(numericValue) ? Math.max(highest, numericValue) : highest;
  }, 1000);

  return `ENR${highestNumber + 1}`;
}

export function createEnrollmentWorkspace(enrollments = []) {
  return {
    studentLookup: "",
    edpLookup: "",
    enroll_code: getNextEnrollmentCode(enrollments),
    enroll_date: new Date().toISOString().slice(0, 10),
    status: "enrolled",
    amt_paid: "",
    student_id: "",
    detailRows: []
  };
}

export function buildEnrollmentStudentOptions(enrollmentRows = [], studentRows = []) {
  const seenStudentIds = new Set();

  return enrollmentRows
    .filter((row) => {
      const studentId = String(row.student_id || "");
      const matchedStudent = studentRows.find((student) => String(student.id) === studentId);

      if (!studentId || !matchedStudent || seenStudentIds.has(studentId)) {
        return false;
      }

      seenStudentIds.add(studentId);
      return true;
    })
    .map((row) => {
      const matchedStudent = studentRows.find((student) => String(student.id) === String(row.student_id));

      return {
        ...row,
        idno: row.idno || matchedStudent?.idno || "",
        lastname: row.lastname || matchedStudent?.lastname || "",
        firstname: row.firstname || matchedStudent?.firstname || ""
      };
    });
}
