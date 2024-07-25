const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config({ path: __dirname + '/.env' });

const app = express();
app.use(cors());
app.use(express.json());

// OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/generate-report', async (req, res) => {
  console.log('Received request to generate report');
  console.log('Request body:', req.body);

  try {
    console.log('Initiating OpenAI API call...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Du bist ein erfahrener orthopädischer Assistent, der präzise und umfassende Berichte erstellt. Deine Aufgabe ist es, die gegebenen Informationen zusammenzufassen und separat auf fehlende wichtige Details in Form einer knappen Liste hinzuweisen." },
        { role: "user", content: `Bitte erstelle drei separate Teile basierend auf folgenden Informationen:

          Anrede: ${req.body.salutation}
          Nachname Initial: ${req.body.lastNameInitial}
          Alter: ${req.body.age}
          NF Anamnese: ${req.body.nfAnamnese}
          Notfall Diagnose(n): ${req.body.notfallDiagnosen}
          Untersuchungsbefunde: ${req.body.untersuchungsbefunde}
          Vorgeschichte: ${req.body.vorgeschichte}
          Nebendiagnosen: ${req.body.nebendiagnosen}
          Medikamente: ${req.body.medikamente}
          Aktueller Aufenthaltsort: ${req.body.aufenthaltsort}
          Procedere: ${req.body.procedere}
          Team: ${req.body.team.join(', ')}
          OA: ${req.body.oa}
          AA: ${req.body.aa}
          
           Erstelle einen zusammenhängenden Text in etwa dieser Form, aber passe ihn an die spezifischen Informationen an:
          
          "[Anrede] [Initial], ist [Alter] Jahre alt und hat sich [NF Anamnese] zugezogen. Der Patient hat eine [Notfalldiagnose]. In der Untersuchung zeigt sich [Untersuchungsbefunde]. Relevante Nebendiagnosen sind [Vorgeschichte und relevante Nebendiagnosen]. Der Patient nimmt [Medikamente] ein. Er/Sie ist aktuell [Aufenthaltsort]. Wir haben folgendes Procedere besprochen: [Procedere]. Verantwortlicher Oberarzt ist [OA]."
          
          2. Konsil:
          Erstelle eine Aufzählung mit den wichtigsten Punkten in dieser Reihenfolge mit den folgenden Überschriften:
          Konsilium Orthopädie [Team] [OA]/[AA]
          1. Name: [Anrede] [Nachname Initial]
          2. Alter
          3. NF Anamnese
          4. Notfall Diagnose(n)
          5. Untersuchungsbefunde
          6. Vorgeschichte
          7. Nebendiagnosen/Medikamente
          8. Aktueller Aufenthaltsort
          9. Procedere
          
          3. Gib basierend auf den spezifischen Informationen Vorschläge zur Vervollständigung (als knappe Liste):
          - Bei dokumentierten Frakturen: Falls Neurologie nicht dokumentiert, darauf hinweisen.
          - Bei "intakter" Neurologie: Vorschlagen, spezifische relevante Nerven zu überprüfen.
          - Bei fehlenden Medikamentenangaben: An Abfrage von Blutverdünnern erinnern.
          - Bei Diagnosen ohne Klassifikation: Vorschlagen, eine hinzuzufügen.
          
          Bitte stelle sicher, dass alle Teile grammatikalisch korrekt und gut lesbar sind. Trenne die drei Teile mit '---'.`
        }
      ],
      max_tokens: 1500
    });
    console.log('OpenAI API call completed');

    const [formattedReport, bulletPoints, suggestions] = completion.choices[0].message.content.split('---').map(text => text.trim());
    console.log('Generated formatted report:', formattedReport);
    console.log('Generated bullet points:', bulletPoints);
    console.log('Generated suggestions:', suggestions);

    res.json({ formattedReport, bulletPoints, suggestions });
  } catch (error) {
    console.error('Error in OpenAI API call:', error);
    res.status(500).json({ error: 'Failed to generate report', details: error.message });
  }
});

const PORT = process.env.PORT;
console.log(`Attempting to start server on port ${PORT}`);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Set' : 'Not set');
  console.log('Using OpenAI model: gpt-4o');
});