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
import { OPENAI_API_KEY } from "./config.local";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import nlp from "compromise";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const extractSkillsNLP = (text) => {
  const doc = nlp(text);
  const nouns = doc.nouns().out("array");
  return nouns;
};

function Resume() {
  const [currentResume, setCurrentResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [adjustedResume, setAdjustedResume] = useState("");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");

  const handleSubmit = async () => {
    setLoading(true);

    let lengthInstruction = "";

    const jobSkills = extractSkillsNLP(jobDescription);

    if (language === "English") {
      lengthInstruction = `Analyze the job description in detail: ${jobDescription}. Provide comprehensive suggestions to change my current resume, which is: ${currentResume}, to align it more closely with the ${jobDescription}. Focus on these skills: ${jobSkills.join(
        ", "
      )}.`;
    } else if (language === "French") {
      // ... (Your existing code for French)
    }

    // Base instruction
    const instruction = `${lengthInstruction}`;

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "You are a helpful assistant.",
              },
              {
                role: "user",
                content: instruction,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const responseData = await response.json();
        console.error("OpenAI API Error:", responseData);
        throw new Error(`OpenAI API responded with status: ${response.status}`);
      }

      const data = await response.json();
      const adjustedResume = data.choices[0].message.content.trim();
      setAdjustedResume(adjustedResume);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard
      .writeText(adjustedResume)
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

  const generatePdf = () => {
    const Resume = document.querySelector("[contentEditable=true]").innerText;

    const docDefinition = {
      content: [{ text: "Cover Letter", style: "header" }, Resume],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
          alignment: "center",
        },
        name: {
          fontSize: 14,
          bold: true,
          margin: [0, 0, 0, 5],
        },
      },
    };

    pdfMake.createPdf(docDefinition).download("resume.pdf");
  };

  return (
    <AppContainer>
      <ContainerForSloganText>
        <SloganText>Welcome to the Job assistance program!</SloganText>
      </ContainerForSloganText>
      <h2>Adjust your resume</h2>

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
          </ConfigurationContainer>
          <h3>Your resume:</h3>
          <div>
            <Label>Copy and paste your resume:</Label>
            <TextareaField
              type="text"
              value={currentResume}
              onChange={(e) => setCurrentResume(e.target.value)}
            />
          </div>
          <h3>Information about vacancy:</h3>
          <div>
            <Label>Copy and paste the vacancy description:</Label>
            <TextareaField
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
          <SendButton onClick={handleSubmit}>
            <h2>Rewrite my resume</h2>
          </SendButton>
        </FormContainer>

        {loading ? (
          <LoadingContainer>
            <Spinner />
            <LoadingMessage>
              Wait, your new Resume is generating...
            </LoadingMessage>
          </LoadingContainer>
        ) : adjustedResume ? (
          <ResumeContainer>
            <h3>Resume</h3>
            <PreformattedTextContainer
              contentEditable={true}
              dangerouslySetInnerHTML={{ __html: adjustedResume }}
            />
            <CopyButton onClick={handleCopyText}>
              Copy your Cover letter
            </CopyButton>
            {copySuccess && (
              <CopySuccessMessage>{copySuccess}</CopySuccessMessage>
            )}
            <CopyButton onClick={generatePdf}>Download as PDF</CopyButton>
          </ResumeContainer>
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

const ContainerForSloganText = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to bottom, #f5f7fa, #e0e5ec);
  background-color: #fff;
`;

const typing = keyframes`
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
`;
const blinkCursor = keyframes`
  from, to {
    border-color: transparent;
  }
  50% {
    border-color: #204c84;
  }
`;

const SloganText = styled.h1`
  color: black;
  margin: 2rem;
  font-family: "Aeroport", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol";
  overflow: hidden;
  white-space: nowrap;
  animation: ${typing} 3s steps(60, end), ${blinkCursor} 0.5s step-end infinite;
  animation-fill-mode: forwards;
  display: block;

  @media (max-width: 1300px) {
    display: none;
  }
`;

const AppContainer = styled.div`
  text-align: center;

  max-width: 95vw;
  margin: 0 auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  background: linear-gradient(to bottom, #f5f7fa, #e0e5ec);
  background-color: #fff;
  border-radius: 8px;
  padding-bottom: 50px;

  @media (max-width: 768px) {
    max-width: 100vw;
    padding: 20px;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0 50px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
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

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
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

  @media (max-width: 768px) {
    width: 100%;
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
  transition: border-color 0.3s, box-shadow 0.3s;

  &:hover {
    border-color: #3498db;
    box-shadow: 0 0 5px rgba(52, 152, 219, 0.2);
  }

  @media (max-width: 768px) {
    width: 60%;
  }
`;

const ResumeContainer = styled.div`
  width: 45%;
  border: 1px solid #ccc;
  padding: 20px;
  height: fit-content;
  overflow-y: auto;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  resize: both; // This line allows the container to be resized both vertically and horizontally
  overflow: hidden; // This makes sure the content does not overflow the box

  @media (max-width: 768px) {
    width: 80vw;
    margin-top: 20px;
  }
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
  width: 106%;
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
  margin: 20px;
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

const PreformattedTextContainer = styled.pre`
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 15px;
`;

export default Resume;
