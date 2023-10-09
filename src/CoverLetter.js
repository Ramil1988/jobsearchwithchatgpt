import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { OPENAI_API_KEY } from "./config.local";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import monctoncares from "./monctoncares.png";
import * as pdfjs from "pdfjs-dist";
import Confetti from "react-confetti";

import {
  Heading,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  CloseButton,
  Box,
} from "@chakra-ui/react";
import { FaChevronCircleDown } from "react-icons/fa";
import { useDisclosure } from "@chakra-ui/react";
import Lottie from "react-lottie";
import * as animationData from "./animation_lni6mgip.json";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

function CoverLetter() {
  const [applicantName, setApplicantName] = useState("");
  const [applicantPhoneNumber, setApplicantPhoneNumber] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [relevantExperience, setRelevantExperience] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Short");
  const [jobDescription, setJobDescription] = useState("");
  const [notification, setNotification] = useState({
    active: false,
    message: "",
  });
  const [confetti, setConfetti] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const {
    isOpen: isAlertOpen,
    onClose: closeAlert,
    onOpen: showAlert,
  } = useDisclosure();
  const [loadingStatus, setLoadingStatus] = useState("");

  const WritingAnimation = () => {
    const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: animationData.default,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    };

    return <Lottie options={defaultOptions} height={400} width={400} />;
  };

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const allFieldsFilled =
      applicantName &&
      applicantPhoneNumber &&
      applicantEmail &&
      jobTitle &&
      companyName &&
      relevantExperience &&
      jobDescription;
    if (allFieldsFilled && notification.active) {
      setNotification({ active: false, message: "" });
    }
  }, [
    applicantName,
    applicantPhoneNumber,
    applicantEmail,
    jobTitle,
    companyName,
    relevantExperience,
    jobDescription,
    notification,
  ]);

  const handleNotificationClose = () => {
    setNotification({ active: false, message: "" });
  };

  const addUserToDatabase = async () => {
    try {
      const response = await fetch(
        "https://monctonservices-com.onrender.com/user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            applicantName,
            applicantPhoneNumber,
            applicantEmail,
            companyName,
            jobTitle,
          }),
        }
      );

      if (response.headers.get("content-type").includes("application/json")) {
        const data = await response.json();
        if (!response.ok) {
          console.error("Error adding user:", data.message);
          throw new Error(data.message);
        }
        console.log("User added successfully:", data.data);
      } else {
        console.error("Not a JSON response:", await response.text());
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmit = async () => {
    let missingFields = [];

    if (!applicantName) missingFields.push("Your Name");
    if (!applicantPhoneNumber) missingFields.push("Your Phone Number");
    if (!applicantEmail) missingFields.push("Your Email");
    if (!jobTitle) missingFields.push("Job Title");
    if (!companyName) missingFields.push("Company Name");
    if (!relevantExperience) missingFields.push("Your Resume");
    if (!jobDescription) missingFields.push("Job Description");

    if (missingFields.length) {
      setNotification({
        active: true,
        message: " " + missingFields.join(", "),
      });
      return;
    }

    setLoading(true);

    const loadingStatuses = [
      "Analyzing your information...",
      "Crafting the perfect sentences...",
      "Polishing your cover letter...",
      "Adjusting the tone and length...",
      "Almost there, hang tight!",
    ];

    let loadingStatusIndex = 0;
    setLoadingStatus(loadingStatuses[loadingStatusIndex]);

    const loadingInterval = setInterval(() => {
      loadingStatusIndex += 1;
      if (loadingStatusIndex < loadingStatuses.length) {
        setLoadingStatus(loadingStatuses[loadingStatusIndex]);
      } else {
        clearInterval(loadingInterval);
      }
    }, 13000);

    // Instructions modifier based on tone
    let toneInstruction = "";

    if (language === "English") {
      if (tone === "Casual") {
        toneInstruction = "Write the cover letter in a casual style.";
      } else {
        toneInstruction = "Write the cover letter in a professional manner.";
      }
    } else if (language === "French") {
      if (tone === "Casual") {
        toneInstruction =
          "Rédigez la lettre de motivation dans un style informel.";
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
Experience: ${relevantExperience}
Job description they are applying for: ${jobDescription}.

Format: Start with the applicant's name, phone number, and email at the top. Address the letter to the company and position. Include skills, experience, interest in the ${jobTitle}, and ${companyName}. Come up with ideas on why you are interested in ${companyName} and in the ${jobTitle}. Do not include Date. Adjust the cover letter to ${jobDescription} accordingly. Do not repeat anything from ${relevantExperience}, rewrite it in a different way.

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
Expérience : ${relevantExperience}
Description du poste pour lequel ils postulent : ${jobDescription}. Adaptez la lettre de motivation à cette description en conséquence.

Format : Commencez par le nom du candidat, son numéro de téléphone et son e-mail en haut de la page. Adressez la lettre à l'entreprise et au poste en question. Incluez les compétences, l'expérience, l'intérêt pour le poste et pour l'entreprise. Venez avec des idées sur les raisons pour lesquelles vous êtes intéressé par ${companyName} et par ${jobTitle}.

${toneInstruction} ${lengthInstruction}
`;
    }
    addUserToDatabase();

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
      setConfetti(true);
      setTimeout(() => setConfetti(false), 10000);
      showAlert();
    } catch (error) {
      console.error(error);
    } finally {
      clearInterval(loadingInterval);
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

  const parsePdf = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target.result;
        const pdfData = new Uint8Array(arrayBuffer);

        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

        try {
          const loadingTask = pdfjs.getDocument({ data: pdfData });
          const pdf = await loadingTask.promise;

          const numPages = pdf.numPages;
          let extractedText = "";

          for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const pageText = await page.getTextContent();
            const pageStrings = pageText.items.map((item) => item.str);
            extractedText += pageStrings.join(" ");
          }

          setRelevantExperience(extractedText);
        } catch (error) {
          console.error("Error parsing PDF:", error);
          setRelevantExperience("An error occurred while processing the PDF.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Please select a PDF file.");
    }
  };

  return (
    <>
      {confetti && (
        <ConfettiContainer>
          <Confetti width={width} height={height} />
        </ConfettiContainer>
      )}
      <AppContainer>
        {isAlertOpen && (
          <AlertSuccess>
            <Alert status="success">
              <AlertIcon />
              <Box>
                <AlertDescription>
                  Cover letter has been generated.
                </AlertDescription>
              </Box>
              <CloseButton
                alignSelf="flex-start"
                position="relative"
                right={-1}
                top={-1}
                onClick={closeAlert}
              />
            </Alert>
          </AlertSuccess>
        )}
        {notification.active && (
          <NotificationContainer>
            <Alert status="error">
              <AlertIcon />
              <AlertTitle>Please fill out the following fields:</AlertTitle>
              <AlertDescription>{notification.message}.</AlertDescription>
              <CloseButton onClick={handleNotificationClose}>X</CloseButton>
            </Alert>
          </NotificationContainer>
        )}
        <Logo src={monctoncares} alt="Icon" />
        <ContainerForSloganText>
          <SloganText>CREATE YOUR COVER LETTER WITH AI</SloganText>
        </ContainerForSloganText>
        <ContentContainer>
          <FormContainer>
            <MobileFriendlyContainer>
              <Menu>
                <MenuButton as={Button} rightIcon={<FaChevronCircleDown />}>
                  Language: {language}
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => setLanguage("English")}>
                    English
                  </MenuItem>
                  <MenuItem onClick={() => setLanguage("French")}>
                    French
                  </MenuItem>
                </MenuList>
              </Menu>
              <Menu>
                <MenuButton as={Button} rightIcon={<FaChevronCircleDown />}>
                  Tone: {tone}
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => setTone("Professional")}>
                    Professional
                  </MenuItem>
                  <MenuItem onClick={() => setTone("Casual")}>Casual</MenuItem>
                </MenuList>
              </Menu>
              <Menu>
                <MenuButton as={Button} rightIcon={<FaChevronCircleDown />}>
                  Length: {length}
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => setLength("Short")}>Short</MenuItem>
                  <MenuItem onClick={() => setLength("Long")}>Long</MenuItem>
                </MenuList>
              </Menu>
            </MobileFriendlyContainer>
            <FilloutSection>
              <DoubleSectionContainer>
                <InsideSection>
                  {" "}
                  <h3>INFORMATION ABOUT YOU</h3>
                  <div>
                    <Label>YOUR NAME</Label>
                    <InputField
                      type="text"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>YOUR PHONE NUMBER</Label>
                    <InputField
                      type="text"
                      value={applicantPhoneNumber}
                      onChange={(e) => setApplicantPhoneNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>YOUR EMAIL</Label>
                    <InputField
                      type="text"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>
                      YOUR RESUME <InputForPdf onChange={parsePdf} />
                    </Label>
                    <TextareaFieldSecond
                      value={relevantExperience}
                      onChange={(e) => setRelevantExperience(e.target.value)}
                    />
                  </div>
                </InsideSection>
                <InsideSection>
                  <h3>INFORMATION ABOUT VACANCY</h3>
                  <div>
                    <Label>JOB TITLE</Label>
                    <InputField
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>COMPANY NAME</Label>
                    <InputField
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>JOB DESCRIPTION</Label>
                    <TextareaFieldThird
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
            <WritingAnimation />
            <LoadingMessage>{loadingStatus}</LoadingMessage>
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

const ConfettiContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  pointer-events: none;
`;

const LoadingContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
`;

const LoadingMessage = styled.p`
  font-size: 30px;
  font-weight: bold;
  color: white;
`;

const Logo = styled.img`
  display: block;
  margin-top: 5px;
`;

const ContainerForSloganText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
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

const SloganText = styled(Heading)`
  color: white;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  background: linear-gradient(
    to right,
    rgba(83, 200, 239, 0.8) 0%,
    rgba(81, 106, 204, 0.8) 96%
  );

  border-radius: 8px;
  padding-bottom: 50px;
`;

const ContentContainer = styled.div`
  display: flex;

  justify-content: space-between;
  justify-content: center;
  padding: 0 50px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  & > h1,
  & > h2,
  & > h3 {
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
    & > h1,
    & > h2,
    & > h3 {
      font-size: 18px;
    }
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const FilloutSection = styled.div`
  display: flex;
  flex-direction: row;
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
  background: linear-gradient(
    to right,
    rgba(83, 200, 239, 0.8) 0%,
    rgba(81, 106, 204, 0.8) 96%
  );

  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);

  opacity: 0;
  animation: ${fadeInUp} 0.8s forwards;

  & > div {
    margin-bottom: 15px;
  }

  & > h1,
  & > h2,
  & > h3 {
    color: white;
    text-shadow: 2px 2px 5px rgba(81, 106, 204, 0.8);
  }

  h3 {
    font-size: 24px;
    margin-bottom: 20px;
  }

  &:hover {
    box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.4);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    button,
    a {
      box-shadow: 0 4px 6px rgba(81, 106, 204, 0.5);
    }
  }

  @media (max-width: 768px) {
    width: 100%;
    margin: 10px 0;
    padding: 10px 20px;
  }
`;

const DoubleSectionContainer = styled.div`
  width: 90vw;
  display: flex;
  flex-direction: row;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 85vw;
  }

  & > ${InsideSection}:nth-child(1) {
    animation-delay: 0.3s;
  }

  & > ${InsideSection}:nth-child(2) {
    animation-delay: 0.9s;
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
  height: 200px;
`;

const TextareaFieldThird = styled(TextareaField)`
  height: 310px;
`;

const Label = styled.label`
  text-align: left;
  color: white;
  font-weight: bold;
  font-size: 20px;
  display: block;
  margin-bottom: 10px;
  margin-right: 10px;
`;

const MobileFriendlyContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const SendButton = styled.button`
  padding: 20px;
  margin: 20px;
  cursor: pointer;
  background: linear-gradient(90deg, #3498db, #8e44ad);
  color: #ffffff;
  font-size: 20px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  transition: background 0.3s ease;
  box-shadow: 0 10px 6px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);

  &:hover {
    background: linear-gradient(90deg, #8e44ad, #3498db);
    box-shadow: 0 15px 10px rgba(81, 106, 204, 0.5);
  }
  @media (max-width: 768px) {
    width: 80%;
  }
`;

const InputForPdf = styled.input.attrs({
  type: "file",
  accept: ".pdf",
})`
  margin: 5px;
  cursor: pointer;
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

const NotificationContainer = styled.div`
  position: fixed;
  width: auto;
  max-width: 1080px;
  top: 50%;
  left: 50%;
  z-index: 100;
  transform: translate(-50%, -50%);
  box-shadow: 0px 15px 15px rgba(0, 0, 0, 0.6);

  @media (max-width: 768px) {
    width: 95%;
  }
`;

const AlertSuccess = styled(NotificationContainer)`
  @media (max-width: 768px) {
    width: 50%;
  }
`;

export default CoverLetter;
