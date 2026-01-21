import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  ChevronRight,
  Copy,
  Zap
} from "lucide-react";

// ==========================================================
// TEXTOS (Se eliminaron los referentes al desarrollador)
// ==========================================================
const CARD_TEXTS = {
  es: {
    title: "TÍTULO GENERADO",
    description: "DESCRIPCIÓN INDUSTRIAL",
    benefits: "BENEFICIOS (MÉTRICAS/LEAN)",
    viable: "VIABLE",
    notViable: "NO VIABLE",
    copied: "¡Copiado!",
    copy: "Copiar",
    seeMore: "Ver más",
    seeLess: "Ver menos",
    level1: "BAJO",
    level2: "MEDIO",
    level3: "ALTO"
  }
};

const copyToClipboard = (text, callback) => {
  navigator.clipboard.writeText(text).then(callback);
};

const CopyButton = ({ content, statusKey, currentStatus, handleCopy, texts }) => {
  const isCopied = currentStatus === statusKey;
  return (
    <button
      onClick={() => handleCopy(content, statusKey)}
      className={`flex items-center text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-sm 
      transition-all duration-200 ${
        isCopied ? "bg-green-500" : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {React.createElement(isCopied ? CheckCircle : Copy, {
        className: "w-3 h-3 mr-1"
      })}
      {isCopied ? texts.copied : texts.copy}
    </button>
  );
};

const OutputCard = ({ data, currentLang, compact = false }) => {
  const texts = CARD_TEXTS[currentLang] || CARD_TEXTS.es;
  const [copiedStatus, setCopiedStatus] = React.useState(null);
  const [expanded, setExpanded] = React.useState(false);

  const title = data.title || "";
  const description = data.description || "";
  const benefits = data.benefits || [];

  const isViable = title.toUpperCase().includes("-V") && !title.toUpperCase().includes("-NV");
  const StatusIcon = isViable ? CheckCircle : XCircle;
  const statusColor = isViable
    ? "bg-green-100 text-green-600 border border-green-300"
    : "bg-red-100 text-red-600 border border-red-300";
  const statusLabel = isViable ? texts.viable : texts.notViable;

  const complexity = data.complexity || { level: "Nivel 1" };
  const complexityColor = "bg-green-100 text-green-600 border border-green-300";
  const ComplexityIcon = Zap;

  const getComplexityLabel = (level) => {
    switch (level) {
      case "Nivel 1": return texts.level1;
      case "Nivel 2": return texts.level2;
      case "Nivel 3": return texts.level3;
      default: return level;
    }
  };

  const handleCopy = (content, key) => {
    setCopiedStatus(key);
    copyToClipboard(content, () => setTimeout(() => setCopiedStatus(null), 2000));
  };

  const benefitsString = benefits.map((b, i) => `${i + 1}. ${b}`).join("\n");

  // VISTA COMPACTA
  if (compact && !expanded) {
    return (
      <motion.div
        className="bg-white shadow-md rounded-xl p-4 border border-gray-200"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800 mr-2">{title}</h3>
          <div className="flex flex-row items-center space-x-2">
            <div className={`flex items-center px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusLabel}
            </div>
            <div className={`flex items-center px-3 py-1 text-xs font-semibold rounded-full ${complexityColor}`}>
              <ComplexityIcon className="w-3 h-3 mr-1" />
              {getComplexityLabel(complexity.level)}
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-3">
          <button onClick={() => setExpanded(true)} className="text-blue-600 font-medium text-sm">
            {texts.seeMore}
          </button>
        </div>
      </motion.div>
    );
  }

  // VISTA COMPLETA
  return (
    <motion.div
      className="bg-white p-6 rounded-2xl shadow-2xl space-y-6 border-t-8 border-yellow-500"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {compact && (
        <button className="text-blue-600 mb-4" onClick={() => setExpanded(false)}>
          {texts.seeLess}
        </button>
      )}

      {/* Título */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-sm font-medium uppercase text-gray-500">{texts.title}</h3>
          <p className="text-xl font-bold text-gray-800 mb-2">{title}</p>
          <CopyButton content={title} statusKey="title" currentStatus={copiedStatus} handleCopy={handleCopy} texts={texts} />
        </div>
        <div className="flex flex-row items-center space-x-2 ml-4">
          <div className={`flex items-center px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusLabel}
          </div>
          <div className={`flex items-center px-3 py-1 text-xs font-semibold rounded-full ${complexityColor}`}>
            <ComplexityIcon className="w-3 h-3 mr-1" />
            {getComplexityLabel(complexity.level)}
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium uppercase text-gray-500">{texts.description}</h3>
          <CopyButton content={description} statusKey="description" currentStatus={copiedStatus} handleCopy={handleCopy} texts={texts} />
        </div>
        <p className="text-gray-700">{description}</p>
      </div>

      {/* Beneficios */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium uppercase text-gray-500">{texts.benefits}</h3>
          <CopyButton content={benefitsString} statusKey="benefits" currentStatus={copiedStatus} handleCopy={handleCopy} texts={texts} />
        </div>
        <ul className="space-y-2">
          {benefits.map((b, i) => (
            <li key={i} className="flex items-start p-3 rounded-lg bg-gray-50">
              <ChevronRight className="w-5 h-5 text-gray-500" />
              <span className="ml-2">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default OutputCard;