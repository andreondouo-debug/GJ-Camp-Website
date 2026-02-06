import React, { useState, useRef } from 'react';
import '../styles/DateInput.css';

/**
 * Input de date avec:
 * - Calendrier popup natif
 * - Saisie manuelle avec auto-formatage JJ/MM/AAAA
 * - Validation format
 */
const DateInput = ({ 
  value, 
  onChange, 
  name, 
  label, 
  placeholder = "JJ/MM/AAAA (ex: 15/03/2000)",
  required = false,
  disabled = false,
  className = ""
}) => {
  const [displayValue, setDisplayValue] = useState(value || '');
  const [showCalendar, setShowCalendar] = useState(false);
  const dateInputRef = useRef(null);
  const textInputRef = useRef(null);

  // Auto-formatage pendant la saisie
  const handleManualInput = (e) => {
    let input = e.target.value.replace(/\D/g, ''); // Garder que les chiffres
    
    // Limiter à 8 chiffres (JJMMAAAA)
    input = input.substring(0, 8);
    
    // Ajouter les slashs automatiquement
    let formatted = '';
    if (input.length > 0) {
      formatted = input.substring(0, 2); // JJ
      if (input.length >= 3) {
        formatted += '/' + input.substring(2, 4); // MM
      }
      if (input.length >= 5) {
        formatted += '/' + input.substring(4, 8); // AAAA
      }
    }
    
    setDisplayValue(formatted);
    
    // Si format complet (JJ/MM/AAAA), notifier le parent
    if (formatted.length === 10 && formatted.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      onChange({
        target: {
          name,
          value: formatted
        }
      });
    } else if (formatted === '') {
      onChange({
        target: {
          name,
          value: ''
        }
      });
    }
  };

  // Conversion date du calendrier vers format JJ/MM/AAAA
  const handleCalendarChange = (e) => {
    const dateValue = e.target.value; // Format YYYY-MM-DD
    if (dateValue) {
      const [year, month, day] = dateValue.split('-');
      const formatted = `${day}/${month}/${year}`;
      setDisplayValue(formatted);
      onChange({
        target: {
          name,
          value: formatted
        }
      });
    }
    setShowCalendar(false);
  };

  // Conversion JJ/MM/AAAA vers YYYY-MM-DD pour le calendrier
  const getCalendarValue = () => {
    if (displayValue && displayValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = displayValue.split('/');
      return `${year}-${month}-${day}`;
    }
    return '';
  };

  const toggleCalendar = () => {
    if (!disabled) {
      setShowCalendar(!showCalendar);
      if (!showCalendar) {
        setTimeout(() => dateInputRef.current?.showPicker?.(), 100);
      }
    }
  };

  return (
    <div className={`date-input-wrapper ${className}`}>
      {label && <label>{label} {required && '*'}</label>}
      
      <div className="date-input-container">
        {/* Input texte pour saisie manuelle */}
        <input
          ref={textInputRef}
          type="text"
          value={displayValue}
          onChange={handleManualInput}
          placeholder={placeholder}
          disabled={disabled}
          className="date-input-text"
          maxLength={10}
        />
        
        {/* Bouton calendrier */}
        <button
          type="button"
          onClick={toggleCalendar}
          disabled={disabled}
          className="date-calendar-btn"
          title="Ouvrir le calendrier"
        >
          📅
        </button>
        
        {/* Input date natif caché pour le calendrier */}
        <input
          ref={dateInputRef}
          type="date"
          value={getCalendarValue()}
          onChange={handleCalendarChange}
          className="date-input-hidden"
          disabled={disabled}
          max="2010-12-31" // Max 13 ans
          min="1950-01-01"
        />
      </div>
      
      <small className="date-input-help">
        Tapez directement 15032000 ou cliquez sur 📅
      </small>
    </div>
  );
};

export default DateInput;
