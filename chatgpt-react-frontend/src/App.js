import { useState } from "react";
import styled from "styled-components";

function App() {
  const [applicantName, setApplicantName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [skills, setSkills] = useState("");
  const [relevantExperience, setRelevantExperience] = useState("");
  const [interestInRole, setInterestInRole] = useState("");
  const [interestInCompany, setInterestInCompany] = useState("");
  const [closingRemarks, setClosingRemarks] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/generateCoverLetter",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            applicantName,
            jobTitle,
            companyName,
            skills: skills.split(",").map((skill) => skill.trim()), // Convert comma-separated string to array
            relevantExperience,
            interestInRole,
            interestInCompany,
            closingRemarks,
          }),
        }
      );

      const data = await response.json();
      setCoverLetter(data.coverLetter);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AppContainer>
      <h1>Welcome to the Job assistance program!!!</h1>
      <h2>Create your cover letter</h2>

      <FormContainer>
        <InputField
          type="text"
          value={applicantName}
          onChange={(e) => setApplicantName(e.target.value)}
          placeholder="Your Name"
        />
        <InputField
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="Job Title"
        />
        <InputField
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Company Name"
        />
        <InputField
          type="text"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="Skills (comma-separated)"
        />
        <TextareaField
          value={relevantExperience}
          onChange={(e) => setRelevantExperience(e.target.value)}
          placeholder="Relevant Experience"
        />
        <TextareaField
          value={interestInRole}
          onChange={(e) => setInterestInRole(e.target.value)}
          placeholder="Why are you interested in the role?"
        />
        <TextareaField
          value={interestInCompany}
          onChange={(e) => setInterestInCompany(e.target.value)}
          placeholder="Why are you interested in the company?"
        />
        <TextareaField
          value={closingRemarks}
          onChange={(e) => setClosingRemarks(e.target.value)}
          placeholder="Closing remarks"
        />
        <SendButton onClick={handleSubmit}>Generate Cover Letter</SendButton>
      </FormContainer>

      {coverLetter && (
        <CoverLetterContainer>
          <h3>Your Cover Letter:</h3>
          <p>{coverLetter}</p>
        </CoverLetterContainer>
      )}
    </AppContainer>
  );
}

const AppContainer = styled.div`
  font-family: Arial, Helvetica, sans-serif;
  text-align: center;
  margin-top: 50px;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 600px;
  margin: 30px auto;
`;

const CoverLetterContainer = styled.div`
  max-width: 600px;
  margin: 30px auto;
  border: 1px solid #ccc;
  padding: 20px;
  overflow-y: auto;
`;

const InputField = styled.input`
  padding: 10px;
  width: 100%;
`;

const TextareaField = styled.textarea`
  padding: 10px;
  width: 100%;
  height: 100px;
`;

const SendButton = styled.button`
  padding: 10px 20px;
`;

export default App;
