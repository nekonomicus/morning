import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    salutation: '',
    dob: '',
    lastNameInitial: '',
    nfAnamnese: '',
    notfallDiagnosen: '',
    untersuchungsbefunde: '',
    vorgeschichte: '',
    nebendiagnosen: '',
    medikamente: '',
    aufenthaltsort: '',
    procedere: '',
    team: [],
    oa: '',
    aa: ''
  });
  const [formattedReport, setFormattedReport] = useState('');
  const [bulletPoints, setBulletPoints] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [age, setAge] = useState('');

  useEffect(() => {
    if (formData.dob) {
      const today = new Date();
      const birthDate = new Date(formData.dob);
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge);
    }
  }, [formData.dob]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prevState => ({
        ...prevState,
        team: checked
          ? [...prevState.team, value]
          : prevState.team.filter(item => item !== value)
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFormattedReport('');
    setBulletPoints('');
    setSuggestions('');
    console.log('Submitting form data:', formData);

    try {
      console.log('Sending request to backend...');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, age }),
      });
      
      console.log('Received response:', response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Parsed response data:', data);
      
      if (data.formattedReport && data.bulletPoints && data.suggestions) {
        setFormattedReport(data.formattedReport);
        setBulletPoints(data.bulletPoints);
        setSuggestions(data.suggestions);
      } else {
        throw new Error('Incomplete report data in response');
      }
    } catch (error) {
      console.error('Error details:', error);
      setError(`Failed to generate report: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="App">
      <h1>Orthopedic Morning Report Generator</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="salutation">Anrede:</label>
          <select
            id="salutation"
            name="salutation"
            value={formData.salutation}
            onChange={handleChange}
            required
          >
            <option value="">Wählen Sie</option>
            <option value="Herr">Herr</option>
            <option value="Frau">Frau</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="dob">Geburtsdatum:</label>
          <input
            id="dob"
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
          />
          {age && <span className="age-display">Alter: {age} Jahre</span>}
        </div>
        <div className="form-group">
          <label htmlFor="lastNameInitial">Nachname Initial:</label>
          <input
            id="lastNameInitial"
            type="text"
            name="lastNameInitial"
            value={formData.lastNameInitial}
            onChange={handleChange}
            maxLength="1"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="nfAnamnese">NF Anamnese:</label>
          <textarea
            id="nfAnamnese"
            name="nfAnamnese"
            value={formData.nfAnamnese}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="notfallDiagnosen">Notfall Diagnose(n):</label>
          <textarea
            id="notfallDiagnosen"
            name="notfallDiagnosen"
            value={formData.notfallDiagnosen}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="untersuchungsbefunde">Untersuchungsbefunde:</label>
          <textarea
            id="untersuchungsbefunde"
            name="untersuchungsbefunde"
            value={formData.untersuchungsbefunde}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="vorgeschichte">Vorgeschichte:</label>
          <textarea
            id="vorgeschichte"
            name="vorgeschichte"
            value={formData.vorgeschichte}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="nebendiagnosen">Nebendiagnosen:</label>
          <textarea
            id="nebendiagnosen"
            name="nebendiagnosen"
            value={formData.nebendiagnosen}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="medikamente">Medikamente:</label>
          <textarea
            id="medikamente"
            name="medikamente"
            value={formData.medikamente}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="aufenthaltsort">Aktueller Aufenthaltsort:</label>
          <input
            id="aufenthaltsort"
            type="text"
            name="aufenthaltsort"
            value={formData.aufenthaltsort}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="procedere">Procedere:</label>
          <textarea
            id="procedere"
            name="procedere"
            value={formData.procedere}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Team:</label>
          {['WS', 'OE', 'Fuss', 'Hüfte', 'Knie'].map(team => (
            <div key={team}>
              <input
                type="checkbox"
                id={team}
                name="team"
                value={team}
                checked={formData.team.includes(team)}
                onChange={handleChange}
              />
              <label htmlFor={team}>{team}</label>
            </div>
          ))}
        </div>
        <div className="form-group">
          <label htmlFor="oa">OA:</label>
          <input
            id="oa"
            type="text"
            name="oa"
            value={formData.oa}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="aa">AA:</label>
          <input
            id="aa"
            type="text"
            name="aa"
            value={formData.aa}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Generiere...' : 'Bericht generieren'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {isLoading && <p className="loading">Bericht wird generiert, bitte warten...</p>}
      {formattedReport && (
        <div className="report">
          <h2>Formulierter Bericht:</h2>
          <p>{formattedReport}</p>
          <button onClick={() => copyToClipboard(formattedReport)}>In die Zwischenablage kopieren</button>
        </div>
      )}
      {bulletPoints && (
        <div className="report">
          <h2>Konsil:</h2>
          <pre>{bulletPoints}</pre>
          <button onClick={() => copyToClipboard(bulletPoints)}>In die Zwischenablage kopieren</button>
        </div>
      )}
      {suggestions && (
        <div className="suggestions">
          <h2>Vorschläge zur Vervollständigung:</h2>
          <pre>{suggestions}</pre>
        </div>
      )}
<footer className="footer">
  <p>Made by Samuel Schaible. Powered by OpenAI's GPT-4o</p>
  <p className="legal-statement">
    This application processes all sensitive data locally on your device. No personal or medical information is shared with external services. This tool is not a medical device and is intended for research purposes only. Users are responsible for ensuring compliance with applicable laws and regulations regarding the handling of sensitive information. The developers make no guarantees regarding the accuracy or completeness of generated reports. Use at your own discretion.
  </p>
</footer>
    </div>
  );
}

export default App;