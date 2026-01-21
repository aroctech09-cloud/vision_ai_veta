// IdeaInput.js (Modificado)
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Zap, Mic, MicOff } from 'lucide-react';

// ==========================================================
// MODIFICACIÓN 1: Ampliar traducciones (Añadidas FR y PT)
// ==========================================================
const INPUT_TEXTS = {
  es: {
    placeholder: 'Describe tu idea para mejorar un proceso o producto (ej: "Usar plástico reciclado en el cuerpo del lapicero").',
    button: 'Generar Mejora',
  },
  en: {
    placeholder: 'Describe your idea for improving a BIC process or product (e.g., "Use recycled plastic in the pen barrel").',
    button: 'Generate Enhancement',
  },
  fr: {
    placeholder: 'Décrivez votre idée pour améliorer un processus ou un produit (ex: "Utiliser du plastique recyclé dans le corps du stylo").',
    button: 'Générer l\'Amélioration',
  },
  pt: {
    placeholder: 'Descreva sua ideia para melhorar um processo ou produto (ex: "Usar plástico reciclado no corpo da caneta").',
    button: 'Gerar Melhoria',
  }
};

const VOICE_TEXTS = {
  es: {
    listening: 'Escuchando...',
    stopped: 'Reconocimiento detenido.',
    notSupported: 'El reconocimiento de voz no es compatible con este navegador.',
  },
  en: {
    listening: 'Listening...',
    stopped: 'Recognition stopped.',
    notSupported: 'Voice recognition is not supported by this browser.',
  },
  fr: {
    listening: 'Écoute...',
    stopped: 'Reconnaissance arrêtée.',
    notSupported: 'La reconnaissance vocale n\'est pas prise en charge par ce navigateur.',
  },
  pt: {
    listening: 'Ouvindo...',
    stopped: 'Reconhecimento parado.',
    notSupported: 'O reconhecimento de voz não é suportado por este navegador.',
  }
};
// ==========================================================

// Define SpeechRecognition para evitar errores de linting/compilación si no está tipado globalmente
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Aceptar las props currentLang y currentText
const IdeaInput = ({ onGenerate, isLoading, currentLang, currentText }) => {
  const [idea, setIdea] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  // Selecciona el texto basado en el idioma (con fallback a 'es')
  const texts = INPUT_TEXTS[currentLang] || INPUT_TEXTS.es;
  const voiceTexts = VOICE_TEXTS[currentLang] || VOICE_TEXTS.es;

  // Referencia al objeto de reconocimiento de voz
  const [recognition, setRecognition] = useState(null);

  // Inicializa el objeto de reconocimiento de voz una sola vez
  useEffect(() => {
    if (SpeechRecognition) {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = false; // Detener después de una pausa
      
      // ==========================================================
      // MODIFICACIÓN 2: Configuración dinámica del idioma del micrófono
      // ==========================================================
      let langCode = 'es-ES'; // Default
      switch (currentLang) {
        case 'en':
          langCode = 'en-US';
          break;
        case 'fr':
          langCode = 'fr-FR';
          break;
        case 'pt':
          // Se usa pt-BR (Portugués de Brasil) que es más común, pero pt-PT también es válido.
          langCode = 'pt-BR'; 
          break;
        default:
          langCode = 'es-ES';
      }
      recognizer.lang = langCode;
      // ==========================================================


      recognizer.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        // Agrega el texto transcrito al estado actual de la idea
        setIdea(prevIdea => prevIdea + (prevIdea.length > 0 ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognizer.onerror = (event) => {
        console.error('Error de reconocimiento de voz:', event.error);
        setIsListening(false);
      };

      recognizer.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognizer);
    }
    
    // Limpieza al desmontar
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [currentLang]); // Re-inicializar si cambia el idioma

  // ... (resto de las funciones handleSubmit y handleVoiceInput sin cambios mayores)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (idea.trim()) {
      onGenerate(idea);
      setIdea('');
      if (recognition && isListening) {
        recognition.stop();
        setIsListening(false);
      }
    }
  };

  const handleVoiceInput = () => {
    if (!SpeechRecognition || !recognition) {
      alert(voiceTexts.notSupported);
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        // Detener la escucha si se estaba ejecutando, para forzar el inicio con el nuevo idioma
        if (recognition.stop) recognition.stop();
        
        setIdea(prevIdea => prevIdea + ' '); // Añadir un espacio antes de la transcripción si ya hay texto
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error al iniciar el reconocimiento:", error);
        setIsListening(false);
      }
    }
  };

  const isInputEmpty = idea.trim().length === 0;

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow-xl space-y-4"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      <div className="relative">
        <textarea
          className={`w-full p-4 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none min-h-[120px] shadow-inner text-gray-800 ${isListening ? 'border-red-500 ring-red-500' : ''}`}
          placeholder={isListening ? voiceTexts.listening : texts.placeholder}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          disabled={isLoading || isListening}
        />
        <motion.button
          type="button"
          onClick={handleVoiceInput}
          disabled={isLoading}
          className={`absolute top-1/2 right-3 -translate-y-1/2 p-2 rounded-full transition-colors ${
            isListening 
              ? 'bg-red-500 text-white shadow-md' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          whileHover={!isLoading && !isListening ? { scale: 1.1 } : {}}
          whileTap={!isLoading ? { scale: 0.9 } : {}}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </motion.button>
      </div>

      <motion.button
        type="submit"
        className={`w-full py-3 px-6 rounded-xl font-semibold text-lg flex items-center justify-center transition-all shadow-lg ${
          isLoading || isInputEmpty || isListening
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-yellow-500 text-white hover:from-blue-700 hover:to-yellow-600'
        }`}
        whileHover={!isLoading && !isInputEmpty && !isListening ? { scale: 1.02 } : {}}
        whileTap={!isLoading && !isInputEmpty && !isListening ? { scale: 0.98 } : {}}
        disabled={isLoading || isInputEmpty || isListening}
      >
        {isLoading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-5 h-5 mr-2" />
            </motion.div>
            {currentText.loading} {/* <-- Traducción del estado de carga */}
          </>
        ) : (
          <>
            <Zap className="w-5 h-5 mr-2" />
            {texts.button} {/* <-- ¡Traducción del botón! */}
          </>
        )}
      </motion.button>
      {isListening && (
        <p className="text-center text-sm text-red-500 font-medium">{voiceTexts.listening}</p>
      )}
    </motion.form>
  );
};

export default IdeaInput;