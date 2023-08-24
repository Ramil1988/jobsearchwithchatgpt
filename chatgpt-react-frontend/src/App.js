import { useState } from "react";
import styled, { keyframes } from "styled-components";

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
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
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
            skills: skills.split(",").map((skill) => skill.trim()),
            relevantExperience,
            interestInRole,
            interestInCompany,
            closingRemarks,
            language,
          }),
        }
      );

      const data = await response.json();
      setCoverLetter(`${language}: ${data.coverLetter}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard
      .writeText(coverLetter)
      .then(() => {
        setCopySuccess("Copied!");
        setTimeout(() => setCopySuccess(""), 2000);
      })
      .catch((err) =>
        console.error("Something went wrong when copying the text: ", err)
      );
  };

  return (
    <AppContainer>
      <h1>Welcome to the Job assistance program!!!</h1>
      <h2>Create your cover letter</h2>

      <ContentContainer>
        <FormContainer>
          <div>
            <Label>Choose language for Cover letter:</Label>
            <DropdownSelect
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="English">English</option>
              <option value="French">French</option>
            </DropdownSelect>
          </div>
          <div>
            <Label>Your Name:</Label>
            <InputField
              type="text"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
            />
          </div>
          <div>
            <Label>Job Title:</Label>
            <InputField
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>
          <div>
            <Label>Company Name:</Label>
            <InputField
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div>
            <Label>Skills (comma-separated):</Label>
            <InputField
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>
          <div>
            <Label>Relevant Experience:</Label>
            <TextareaField
              value={relevantExperience}
              onChange={(e) => setRelevantExperience(e.target.value)}
            />
          </div>
          <div>
            <Label>Why are you interested in the role?</Label>
            <TextareaField
              value={interestInRole}
              onChange={(e) => setInterestInRole(e.target.value)}
            />
          </div>
          <div>
            <Label>Why are you interested in the company?</Label>
            <TextareaField
              value={interestInCompany}
              onChange={(e) => setInterestInCompany(e.target.value)}
            />
          </div>
          <div>
            <Label>Closing remarks:</Label>
            <TextareaField
              value={closingRemarks}
              onChange={(e) => setClosingRemarks(e.target.value)}
            />
          </div>
          <SendButton onClick={handleSubmit}>
            <h2>Generate Cover Letter</h2>
          </SendButton>
        </FormContainer>

        {loading ? (
          <LoadingContainer>
            <Spinner />
            <LoadingMessage>
              Wait, your Cover Letter is generating...
            </LoadingMessage>
          </LoadingContainer>
        ) : coverLetter ? (
          <CoverLetterContainer>
            <h3>Your Cover Letter:</h3>
            <p>{coverLetter}</p>
            <CopyButton onClick={handleCopyText}>
              Copy your Cover letter
            </CopyButton>
            {copySuccess && (
              <CopySuccessMessage>{copySuccess}</CopySuccessMessage>
            )}
          </CoverLetterContainer>
        ) : null}
      </ContentContainer>
    </AppContainer>
  );
}

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 45%;
  gap: 20px;
`;

const LoadingMessage = styled.p`
  font-size: 16px;
  font-weight: bold;
  color: #3498db;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  margin: 60px auto;
  border: 16px solid #f3f3f3;
  border-top: 16px solid #3498db;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: ${spin} 2s linear infinite;
  border-top-color: #3498db;
`;

const AppContainer = styled.div`
  text-align: center;
  padding-top: 50px;
  max-width: 1200px;
  margin: 0 auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  border-radius: 8px;
  padding-bottom: 50px;
`;

const ContentContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0 50px;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 45%;

  & > div {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
`;

const DropdownSelect = styled.select`
  padding: 10px 15px;
  width: 30%;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 16px;
  appearance: none;
  background-color: #ffffff;
`;

const CoverLetterContainer = styled.div`
  width: 45%;
  border: 1px solid #ccc;
  padding: 20px;
  height: fit-content;
  overflow-y: auto;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
`;

const InputField = styled.input`
  padding: 10px 15px;
  width: 100%;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:focus {
    border-color: #3498db;
    box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
    outline: none;
  }

  &::placeholder {
    color: #b3b3b3;
  }

  &:hover {
    border-color: #b3b3b3;
  }
`;

const TextareaField = styled.textarea`
  padding: 10px 15px;
  width: 100%;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 16px;
  height: 100px;
  resize: vertical;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:focus {
    border-color: #3498db;
    box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
    outline: none;
  }

  &::placeholder {
    color: #b3b3b3;
  }

  &:hover {
    border-color: #b3b3b3;
  }
`;

const Label = styled.label`
  text-align: left;
  font-weight: bold;
`;

const SendButton = styled.button`
  
  width: 107%;
  cursor: pointer;
  background: linear-gradient(90deg, #3498db, #8e44ad);
  color: #ffffff;
  border: none;
  border-radius: 4px;
  transition: background 0.3s ease;

  &:hover {
    background: linear-gradient(90deg, #8e44ad, #3498db);
  }
`;

const CopyButton = styled.button`
  margin-top: 20px;
  padding: 10px;
  cursor: pointer;
  background-color: #3498db;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2980b9;
  }
`;

const CopySuccessMessage = styled.span`
  margin-left: 10px;
  color: #27ae60;
  font-weight: bold;
`;

export default App;
