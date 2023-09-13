import { useState } from "react";
import styled, { keyframes } from "styled-components";
import { OPENAI_API_KEY } from "./config.local";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

function CoverLetter() {
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
  const [length, setLength] = useState("Short");
  const [jobDescription, setJobDescription] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    // Instructions modifier based on tone
    let toneInstruction = "";

    if (language === "English") {
      if (tone === "Casual") {
        toneInstruction = "Write the cover letter in a casual style.";
      } else if (tone === "Friendly") {
        toneInstruction = "Write the cover letter in a friendly manner.";
      } else {
        toneInstruction = "Write the cover letter in a professional manner.";
      }
    } else if (language === "French") {
      if (tone === "Casual") {
        toneInstruction =
          "Rédigez la lettre de motivation dans un style informel.";
      } else if (tone === "Friendly") {
        toneInstruction =
          "Rédigez la lettre de motivation d'une manière amicale.";
      } else {
        toneInstruction =
          "Rédigez la lettre de motivation d'une manière professionnelle.";
      }
    }

    let lengthInstruction = "";

    if (language === "English") {
      if (length === "Short") {
        lengthInstruction =
          "It's crucial to keep the cover letter concise and to the point. Avoid unnecessary details.";
      } else if (length === "Long") {
        lengthInstruction =
          "It's essential to provide an extensive cover letter. Expound on every aspect mentioned and give detailed explanations.";
      }
    } else if (language === "French") {
      if (length === "Short") {
        lengthInstruction =
          "Il est crucial de garder la lettre de motivation concise et précise. Évitez les détails inutiles.";
      } else if (length === "Long") {
        lengthInstruction =
          "Il est essentiel de fournir une lettre de motivation détaillée. Élaborez sur chaque aspect mentionné et donnez des explications détaillées.";
      }
    }

    // Base instruction
    let instruction = `
Generate a cover letter for:
Name: ${applicantName}
Phone: ${applicantPhoneNumber}
Email: ${applicantEmail}

Addressing to:
Company: ${companyName}
Position: ${jobTitle}

Details:
Skills: ${skills
      .split(",")
      .map((skill) => skill.trim())
      .join(", ")}
Experience: ${relevantExperience}
Job description they are applying for: ${jobDescription}. 

Format: Start with the applicant's name, phone number, and email at the top. Address the letter to the company and position. Include skills, experience, interest in the role, and company. Come up with ideas on why you are interested in ${companyName} and in the ${jobTitle}. Do not include Date. Adjust the cover letter to this description accordingly.

${toneInstruction} ${lengthInstruction}
`;

    if (language === "French") {
      instruction = `
Générez une lettre de motivation pour :
Nom : ${applicantName}
Téléphone : ${applicantPhoneNumber}
E-mail : ${applicantEmail}

Adresse à :
Entreprise : ${companyName}
Poste : ${jobTitle}

Détails :
Compétences : ${skills
        .split(",")
        .map((skill) => skill.trim())
        .join(", ")}
Expérience : ${relevantExperience}
Description du poste pour lequel ils postulent : ${jobDescription}. Adaptez la lettre de motivation à cette description en conséquence.

Format : Commencez par le nom du candidat, son numéro de téléphone et son e-mail en haut de la page. Adressez la lettre à l'entreprise et au poste en question. Incluez les compétences, l'expérience, l'intérêt pour le poste et pour l'entreprise. Venez avec des idées sur les raisons pour lesquelles vous êtes intéressé par ${companyName} et par ${jobTitle}.

${toneInstruction} ${lengthInstruction}
`;
    }

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
      const coverLetter = data.choices[0].message.content.trim();
      setCoverLetter(coverLetter);
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

  const generatePdf = () => {
    const CoverLetter = document.querySelector(
      "[contentEditable=true]"
    ).innerText;

    const docDefinition = {
      content: [{ text: "Cover Letter", style: "header" }, CoverLetter],
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

    pdfMake.createPdf(docDefinition).download("cover_letter.pdf");
  };

  return (
    <>
      <AppContainer>
        <ContainerForSloganText>
          <SloganText>CREATE YOUR COVER LETTER WITH AI</SloganText>
        </ContainerForSloganText>
        <ContentContainer>
          <FormContainer>
            <ConfigurationContainer>
              <div>
                <Label>LANGUAGE FOR COVER LETTER:</Label>
                <DropdownSelect
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="English">English</option>
                  <option value="French">French</option>
                </DropdownSelect>
              </div>
              <div>
                <Label>TONE:</Label>
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
                <Label>LENGTH:</Label>
                <DropdownSelect
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                >
                  <option value="Short">Short</option>
                  <option value="Long">Long</option>
                </DropdownSelect>
              </div>
            </ConfigurationContainer>
            <FilloutSection>
              <DoubleSectionContainer>
                <InsideSection>
                  {" "}
                  <h3>INFORMATION ABOUT YOU:</h3>
                  <div>
                    <Label>YOUR NAME:</Label>
                    <InputField
                      type="text"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>YOUR PHONE NUMBER:</Label>
                    <InputField
                      type="text"
                      value={applicantPhoneNumber}
                      onChange={(e) => setApplicantPhoneNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>YOUR EMAIL:</Label>
                    <InputField
                      type="text"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>YOUR SKILLS (comma-separated):</Label>
                    <TextareaField
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>
                      YOUR EXPERIENCE (job, period, duties. Grab from CV):
                    </Label>
                    <TextareaField
                      value={relevantExperience}
                      onChange={(e) => setRelevantExperience(e.target.value)}
                    />
                  </div>
                </InsideSection>
                <InsideSection>
                  <h3>INFORMATION ABOUT VACANCY:</h3>
                  <div>
                    <Label>JOB TITLE:</Label>
                    <InputField
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>COMPPANY NAME:</Label>
                    <InputField
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>JOB DESCRIPTION:</Label>
                    <TextareaFieldSecond
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>
                </InsideSection>
              </DoubleSectionContainer>
            </FilloutSection>
            <SendButton onClick={handleSubmit}>
              <h2>GENERATE YOUR COVER LETTER</h2>
            </SendButton>
          </FormContainer>
        </ContentContainer>
        {loading ? (
          <LoadingContainer>
            <Spinner />
            <LoadingMessage>
              Wait, your Cover Letter is generating...
            </LoadingMessage>
          </LoadingContainer>
        ) : coverLetter ? (
          <CoverLetterContainer>
            <h3>Cover Letter</h3>
            <PreformattedTextContainer
              contentEditable={true}
              dangerouslySetInnerHTML={{ __html: coverLetter }}
            />
            <CopyButton onClick={handleCopyText}>
              Copy your Cover letter
            </CopyButton>
            {copySuccess && (
              <CopySuccessMessage>{copySuccess}</CopySuccessMessage>
            )}
            <CopyButton onClick={generatePdf}>Download as PDF</CopyButton>
          </CoverLetterContainer>
        ) : null}
      </AppContainer>
    </>
  );
}



const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 45%;
  gap: 10px;
`;

const LoadingMessage = styled.p`
  font-size: 30px;
  font-weight: bold;
  color: white;
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
  width: 90vw;
  justify-content: center;
  align-items: center;
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
  color: white;
  margin-bottom: 4rem;
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  background:rgb(59 110 246 / 0.5);
  
  border-radius: 8px;
  padding-bottom: 50px;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  justify-content: center;
  padding: 0 50px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ConfigurationContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 40%;

  & > div {
    flex: 1;
    display: flex;
    justify-content: space-between;
  }

  @media (max-width: 1300px) {
    margin: 20px;
    width: 60%;
    
  }

  @media (max-width: 768px) {
    flex-direction: column;
    width: 80%;
    & > div {
      width: 100%;
      justify-content: space-between;
      margin-bottom: 20px;
    }
  }
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;


  & > h1, & > h2, & > h3 {
    color: white;
  }

  & > div {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  @media (max-width: 768px) {
    width: 95%;
    margin-top: 20px;
    & > h1, & > h2, & > h3 {
      font-size: 18px;
    }}
`;

const FilloutSection = styled.div`
  display: flex;
  flex-direction: row;
`;

const DoubleSectionContainer = styled.div`
  width: 90vw;
  display: flex;
  flex-direction: row;


  @media (max-width: 768px) {
    flex-direction: column;
    width: 85vw;
  }
`;

const InsideSection = styled.div`
  flex: 1;
  width: 45%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  margin: 20px;
  box-sizing: border-box;
  padding: 20px 40px;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);

  & > div {
    margin-bottom: 15px;
  }

  & > h1, & > h2, & > h3 {
    color: white;
  }

  &:last-child {
    margin-bottom: 0;
  }

  h3 {
    font-size: 24px;
    margin-bottom: 20px;
  }

  &:hover {
    border-color: #b3b3b3;
    transform: scale(1.01);
  }

  @media (max-width: 768px) {
    width: 100%;
    margin: 10px 0;
    padding: 10px 20px;
  }
`;

const DropdownSelect = styled.select`
  padding: 10px 15px;
  width: 30%;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  appearance: none;
  background-color: #ffffff;
  transition: border-color 0.3s, box-shadow 0.3s;

  &:hover {
    border-color: #3498db;
    box-shadow: 0 0 5px rgba(52, 152, 219, 0.2);
  }

  @media (max-width: 768px) {
    width: 50%;
    
  }
`;

const CoverLetterContainer = styled.div`
  width: 50%;
  margin: 20px;
  border: 1px solid #ccc;
  padding: 20px;
  height: fit-content;
  overflow-y: auto;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  resize: both;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 80vw;
    margin-top: 20px;
  }
`;

const InputField = styled.input`
  padding: 10px 15px;
  width: 95%;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
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

  @media (max-width: 768px) {
    width: 90%;
  }
`;

const TextareaField = styled.textarea`
  padding: 10px 15px;
  width: 95%;

  border: 2px solid #e0e0e0;
  border-radius: 8px;
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

  @media (max-width: 768px) {
    width: 90%;
  }
`;

const TextareaFieldSecond = styled(TextareaField)`
height: 300px;
`

const Label = styled.label`
  text-align: left;
  color: white;
  font-weight: bold;
  font-size: 20px;
  display: block;
  margin-bottom: 10px;
`;

const SendButton = styled.button`
  width: 30%;
  margin: 20px;
  cursor: pointer;
  background: linear-gradient(90deg, #3498db, #8e44ad);
  color: #ffffff;
  border: none;
  border-radius: 4px;
  transition: background 0.3s ease;

  &:hover {
    background: linear-gradient(90deg, #8e44ad, #3498db);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 1px 0;
  }
`;

const CopyButton = styled.button`
  margin: 20px;
  padding: 10px;
  cursor: pointer;
  background: linear-gradient(90deg, #3498db, #8e44ad);
  color: #ffffff;
  border: none;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background: linear-gradient(90deg, #8e44ad, #3498db);
  }
`;

const CopySuccessMessage = styled.span`
  margin-left: 10px;
  color: #27ae60;
  font-weight: bold;
`;

const PreformattedTextContainer = styled.pre`
  background-color: #ffffff;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow: hidden;
  border: 1px solid #dcdcdc;
`;

export default CoverLetter;
