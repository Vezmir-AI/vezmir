import React from 'react';
import ArtifactButton from './ArtifactButton';

const renderArtifact = (
  title: string,
  language: string,
  content: string,
  key: string,
  copiedStates: { [key: string]: boolean },
  setCopiedStates: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>,
  isStreaming: boolean // Add this line
) => {
  console.log('Artifact content:', content);

  return (
    <div key={key} className="artifact-container">
      <div className="artifact-info">
        Artifact: {title} ({language})
      </div>
      <ArtifactButton
        title={title}
        language={language}
        content={content}
        copiedStates={copiedStates}
        setCopiedStates={setCopiedStates}
        artifactKey={key}
        isStreaming={isStreaming} // Add this line
      />
    </div>
  );
};

export default renderArtifact;
