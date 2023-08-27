import { useState } from "react";
import styled, { keyframes } from "styled-components";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import { AbortController } from "node-abort-controller";

function App() {
  const [applicantName, setApplicantName] = useState("");
  const [applicantPhoneNumber, setApplicantPhoneNumber] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [skills, setSkills] = useState("");
  const [relevantExperience, setRelevantExperience] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [jobDescription, setJobDescription] = useState("");
  global.AbortController = AbortController;

  const handleSubmit = async () => {
    const controller = new AbortController();
    const { signal } = controller;
    setLoading(true);
    try {
      const response = await fetch(
        ("https://jobsearchwithchatgpt.onrender.com/generateCoverLetter",
        { signal }),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            applicantName,
            applicantPhoneNumber,
            applicantEmail,
            jobTitle,
            companyName,
            skills: skills.split(",").map((skill) => skill.trim()),
            relevantExperience,
            jobDescription,
            language,
            tone,
            length,
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

  const convertHtmlToDocxParagraphs = (htmlString) => {
    const div = document.createElement("div");
    div.innerHTML = htmlString;

    const parseNode = (node) => {
      if (node.nodeType === 3) {
        return new TextRun(node.nodeValue);
      }

      if (node.nodeType === 1) {
        const children = Array.from(node.childNodes).map(parseNode);
        switch (node.tagName.toLowerCase()) {
          case "b":
            return new TextRun({ children, bold: true });
          case "i":
            return new TextRun({ children, italic: true });
          default:
            return new TextRun({ children });
        }
      }

      return null;
    };

    return Array.from(div.childNodes).map(parseNode);
  };

  const generateDocx = () => {
    const coverLetterParagraphs = convertHtmlToDocxParagraphs(coverLetter);

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: "Cover Letter",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${applicantName}`,
                  bold: true,
                }),
                new TextRun(`\n${applicantPhoneNumber}`),
                new TextRun(`\n${applicantEmail}`),
              ],
            }),
            new Paragraph({
              text: `\nDear Hiring Manager at ${companyName},`,
              bold: true,
            }),
            ...coverLetterParagraphs,
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "cover_letter.docx";
      anchor.click();

      URL.revokeObjectURL(url);
    });
  };

  return (
    <AppContainer>
      <h1>Welcome to the Job assistance program!</h1>
      <h2>Create your cover letter</h2>

      <ContentContainer>
        <FormContainer>
          <h3>Configuration:</h3>
          <ConfigurationContainer>
            <div>
              <Label>Language for Cover letter:</Label>
              <DropdownSelect
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="English">English</option>
                <option value="French">French</option>
              </DropdownSelect>
            </div>
            <div>
              <Label>Tone:</Label>
              <DropdownSelect
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                <option value="Professional">Professional</option>
                <option value="Friendly">Friendly</option>
                <option value="Casual">Casual</option>
              </DropdownSelect>
            </div>
            <div>
              <Label>Length:</Label>
              <DropdownSelect
                value={length}
                onChange={(e) => setLength(e.target.value)}
              >
                <option value="Short">Short</option>
                <option value="Long">Long</option>
              </DropdownSelect>
            </div>
          </ConfigurationContainer>
          <h3>Information about you:</h3>
          <div>
            <Label>Your Name:</Label>
            <InputField
              type="text"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
            />
          </div>
          <div>
            <Label>Your Phone number:</Label>
            <InputField
              type="text"
              value={applicantPhoneNumber}
              onChange={(e) => setApplicantPhoneNumber(e.target.value)}
            />
          </div>
          <div>
            <Label>Your email:</Label>
            <InputField
              type="text"
              value={applicantEmail}
              onChange={(e) => setApplicantEmail(e.target.value)}
            />
          </div>
          <div>
            <Label>Your skills (comma-separated):</Label>
            <InputField
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>
          <div>
            <Label>Your Experience:</Label>
            <TextareaField
              value={relevantExperience}
              onChange={(e) => setRelevantExperience(e.target.value)}
            />
          </div>
          <h3>Information about vacancy:</h3>
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
            <Label>Job Description:</Label>
            <TextareaField
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
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
            <div dangerouslySetInnerHTML={{ __html: coverLetter }} />
            <CopyButton onClick={handleCopyText}>
              Copy your Cover letter
            </CopyButton>
            {copySuccess && (
              <CopySuccessMessage>{copySuccess}</CopySuccessMessage>
            )}
            {/* <CopyButton
              onClick={() =>
                generateDocx(
                  applicantName,
                  applicantPhoneNumber,
                  applicantEmail,
                  companyName,
                  coverLetter
                )
              }
            >
              Download as DOCX
            </CopyButton> */}
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
  max-width: 95vw;
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

const ConfigurationContainer = styled.div`
  display: flex;
  flex-direction: row;

  justify-content: space-between;
  gap: 60px;

  & > div {
    flex: 1;
    display: flex;
    justify-content: space-between;
  }
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
