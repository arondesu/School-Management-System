import { useEffect, useMemo, useState } from "react";
import { buildEnrollmentStudentOptions, createEnrollmentWorkspace, getNextEnrollmentCode } from "../utils/enrollment";
import { normalizeSearchValue } from "../utils/formatters";

function useEnrollmentWorkspace({
  activeResource,
  records,
  setErrors,
  setActionAlert,
  loadAllResources
}) {
  const enrollmentHeaderResource = "enrollment";
  const enrollmentDetailsResource = "enrollment_details";

  const [enrollmentDraft, setEnrollmentDraft] = useState(() => createEnrollmentWorkspace());
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState("");

  const isEnrollmentWorkspaceResource = activeResource === enrollmentHeaderResource;
  const isCustomEnrollmentScreen = isEnrollmentWorkspaceResource || activeResource === enrollmentDetailsResource;

  const studentRows = useMemo(() => records.students || [], [records.students]);
  const subjectOfferings = useMemo(() => records.subjectoffered || [], [records.subjectoffered]);
  const enrollmentRows = useMemo(() => records.enrollment || [], [records.enrollment]);
  const enrollmentDetailRows = useMemo(() => records.enrollment_details || [], [records.enrollment_details]);

  const selectedStudent = studentRows.find((student) => String(student.id) === String(enrollmentDraft.student_id)) || null;
  const selectedEnrollment =
    enrollmentRows.find((enrollment) => String(enrollment.enroll_id) === String(selectedEnrollmentId)) || null;

  const selectedStudentId = selectedEnrollment?.student_id ? String(selectedEnrollment.student_id) : "";
  const selectedEnrollmentStudent = studentRows.find((student) => String(student.id) === selectedStudentId) || null;

  const selectedStudentEnrollmentRows = useMemo(
    () => (selectedStudentId ? enrollmentRows.filter((row) => String(row.student_id || "") === selectedStudentId) : []),
    [enrollmentRows, selectedStudentId]
  );

  const selectedStudentEnrollmentIds = useMemo(
    () => new Set(selectedStudentEnrollmentRows.map((row) => String(row.enroll_id))),
    [selectedStudentEnrollmentRows]
  );

  const enrollmentStudentOptions = useMemo(
    () => buildEnrollmentStudentOptions(enrollmentRows, studentRows),
    [enrollmentRows, studentRows]
  );

  const totalUnits = enrollmentDraft.detailRows.reduce((sum, row) => sum + Number(row.units || 0), 0);

  const selectedEnrollmentDetails = enrollmentDetailRows
    .filter((row) => selectedStudentEnrollmentIds.has(String(row.enroll_id)))
    .map((row) => {
      const offering = subjectOfferings.find((item) => String(item.suboffid) === String(row.suboffid)) || {};
      return {
        ...row,
        days: offering.days || "",
        room: offering.room || "",
        start_time: offering.start_time || "",
        end_time: offering.end_time || "",
        units: offering.units || 0
      };
    });

  const selectedEnrollmentTotalUnits = selectedEnrollmentDetails.reduce((sum, row) => sum + Number(row.units || 0), 0);

  useEffect(() => {
    if (activeResource !== enrollmentDetailsResource) {
      return;
    }

    setSelectedEnrollmentId((previous) => {
      if (previous && enrollmentStudentOptions.some((row) => String(row.enroll_id) === String(previous))) {
        return previous;
      }

      return enrollmentStudentOptions[0] ? String(enrollmentStudentOptions[0].enroll_id) : "";
    });
  }, [activeResource, enrollmentStudentOptions]);

  useEffect(() => {
    if (!records.enrollment || !isEnrollmentWorkspaceResource) {
      return;
    }

    setEnrollmentDraft((previous) => {
      if (previous.student_id || previous.studentLookup || previous.edpLookup || previous.detailRows.length) {
        return previous;
      }

      return {
        ...previous,
        enroll_code: getNextEnrollmentCode(records.enrollment)
      };
    });
  }, [records.enrollment, isEnrollmentWorkspaceResource]);

  useEffect(() => {
    if (!enrollmentDraft.student_id) {
      return;
    }

    const hasStudent = studentRows.some((student) => String(student.id) === String(enrollmentDraft.student_id));
    if (hasStudent) {
      return;
    }

    setEnrollmentDraft((previous) => ({
      ...previous,
      student_id: "",
      studentLookup: ""
    }));
  }, [enrollmentDraft.student_id, studentRows]);

  function updateEnrollmentDraft(field, value) {
    setEnrollmentDraft((previous) => ({
      ...previous,
      [field]: value
    }));
  }

  function resetEnrollmentDraft() {
    setEnrollmentDraft(createEnrollmentWorkspace(records.enrollment || []));
  }

  function resetEnrollmentSelection() {
    setSelectedEnrollmentId(enrollmentStudentOptions[0] ? String(enrollmentStudentOptions[0].enroll_id) : "");
  }

  function handleStudentLookup() {
    const lookupValue = normalizeSearchValue(enrollmentDraft.studentLookup);

    if (!lookupValue) {
      setErrors((previous) => ({
        ...previous,
        [enrollmentHeaderResource]: "Enter a student ID number before searching."
      }));
      return;
    }

    const matchedStudent =
      studentRows.find((student) => normalizeSearchValue(student.idno) === lookupValue) ||
      studentRows.find((student) => normalizeSearchValue(student.id) === lookupValue);

    if (!matchedStudent) {
      setErrors((previous) => ({
        ...previous,
        [enrollmentHeaderResource]: "Student not found."
      }));
      return;
    }

    setErrors((previous) => ({
      ...previous,
      [enrollmentHeaderResource]: ""
    }));

    setEnrollmentDraft((previous) => ({
      ...previous,
      studentLookup: String(matchedStudent.idno || ""),
      student_id: String(matchedStudent.id)
    }));
  }

  function handleOfferingLookup() {
    const lookupValue = normalizeSearchValue(enrollmentDraft.edpLookup);

    if (!lookupValue) {
      setErrors((previous) => ({
        ...previous,
        [enrollmentHeaderResource]: "Enter an EDP code before adding a subject."
      }));
      return;
    }

    const matchedOffering =
      subjectOfferings.find((offering) => normalizeSearchValue(offering.edpcode) === lookupValue) ||
      subjectOfferings.find((offering) => normalizeSearchValue(offering.suboffid) === lookupValue);

    if (!matchedOffering) {
      setErrors((previous) => ({
        ...previous,
        [enrollmentHeaderResource]: "Subject offering not found."
      }));
      return;
    }

    const alreadyAdded = enrollmentDraft.detailRows.some((row) => String(row.suboffid) === String(matchedOffering.suboffid));
    if (alreadyAdded) {
      setErrors((previous) => ({
        ...previous,
        [enrollmentHeaderResource]: "That EDP code is already in the subject list."
      }));
      return;
    }

    setEnrollmentDraft((previous) => ({
      ...previous,
      edpLookup: "",
      detailRows: [
        ...previous.detailRows,
        {
          suboffid: matchedOffering.suboffid,
          edpcode: matchedOffering.edpcode,
          subjcode: matchedOffering.subjcode,
          subjdesc: matchedOffering.subjdesc,
          days: matchedOffering.days,
          room: matchedOffering.room,
          start_time: matchedOffering.start_time,
          end_time: matchedOffering.end_time,
          units: matchedOffering.units || 0
        }
      ]
    }));

    setErrors((previous) => ({
      ...previous,
      [enrollmentHeaderResource]: ""
    }));
  }

  function handleRemoveDraftRow(suboffid) {
    setEnrollmentDraft((previous) => ({
      ...previous,
      detailRows: previous.detailRows.filter((row) => String(row.suboffid) !== String(suboffid))
    }));
  }

  async function handleEnrollmentSave() {
    if (!enrollmentDraft.student_id) {
      setErrors((previous) => ({
        ...previous,
        [enrollmentHeaderResource]: "Select a student before saving."
      }));
      return;
    }

    if (!enrollmentDraft.detailRows.length) {
      setErrors((previous) => ({
        ...previous,
        [enrollmentHeaderResource]: "Add at least one subject before saving."
      }));
      return;
    }

    try {
      const enrollmentPayload = {
        enroll_code: enrollmentDraft.enroll_code,
        enroll_date: enrollmentDraft.enroll_date,
        student_id: enrollmentDraft.student_id,
        status: enrollmentDraft.status,
        amt_paid: enrollmentDraft.amt_paid || "0"
      };

      const enrollmentResponse = await fetch("/enrollment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enrollmentPayload)
      });

      if (!enrollmentResponse.ok) {
        throw new Error("Failed to save enrollment header.");
      }

      const enrollmentResult = await enrollmentResponse.json();
      const enrollId = enrollmentResult.insertId;

      if (!enrollId) {
        throw new Error("Enrollment saved, but no enrollment ID was returned.");
      }

      await Promise.all(
        enrollmentDraft.detailRows.map((row) =>
          fetch("/enrollment_details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              enroll_id: enrollId,
              suboffid: row.suboffid
            })
          }).then((response) => {
            if (!response.ok) {
              throw new Error("Failed to save one of the enrollment subjects.");
            }
            return response.json();
          })
        )
      );

      await loadAllResources(true);
      setActionAlert(`Enrollment ${enrollmentDraft.enroll_code} saved.`);
      setErrors((previous) => ({
        ...previous,
        [enrollmentHeaderResource]: ""
      }));

      setEnrollmentDraft(
        createEnrollmentWorkspace([...(records.enrollment || []), { enroll_code: enrollmentDraft.enroll_code }])
      );
    } catch (error) {
      setErrors((previous) => ({
        ...previous,
        [enrollmentHeaderResource]: error.message
      }));
    }
  }

  return {
    enrollmentHeaderResource,
    enrollmentDetailsResource,
    isEnrollmentWorkspaceResource,
    isCustomEnrollmentScreen,
    enrollmentDraft,
    updateEnrollmentDraft,
    resetEnrollmentDraft,
    handleStudentLookup,
    selectedStudent,
    totalUnits,
    handleOfferingLookup,
    handleRemoveDraftRow,
    handleEnrollmentSave,
    selectedEnrollmentId,
    setSelectedEnrollmentId,
    enrollmentStudentOptions,
    selectedEnrollmentStudent,
    selectedEnrollment,
    selectedStudentEnrollmentRows,
    selectedEnrollmentDetails,
    selectedEnrollmentTotalUnits,
    resetEnrollmentSelection
  };
}

export default useEnrollmentWorkspace;
