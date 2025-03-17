'use client';

import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

// Tema tanımlamaları
const themes = {
  cyberpunk: {
    name: 'Cyberpunk',
    icon: '🌟',
    particleIcon: '⚡',
    uploadIcon: 'https://em-content.zobj.net/source/microsoft-teams/337/high-voltage_26a1.png',
    headerIcons: {
      left: 'https://em-content.zobj.net/source/microsoft-teams/337/glowing-star_1f31f.png',
      right: 'https://em-content.zobj.net/source/microsoft-teams/337/sparkles_2728.png'
    }
  },
  midnight: {
    name: 'Midnight',
    icon: '🌙',
    particleIcon: '✨',
    uploadIcon: 'https://em-content.zobj.net/source/microsoft-teams/337/crescent-moon_1f319.png',
    headerIcons: {
      left: 'https://em-content.zobj.net/source/microsoft-teams/337/star-and-crescent_262a.png',
      right: 'https://em-content.zobj.net/source/microsoft-teams/337/milky-way_1f30c.png'
    }
  },
  aurora: {
    name: 'Aurora',
    icon: '🌈',
    particleIcon: '💫',
    uploadIcon: 'https://em-content.zobj.net/source/microsoft-teams/337/rainbow_1f308.png',
    headerIcons: {
      left: 'https://em-content.zobj.net/source/microsoft-teams/337/sparkles_2728.png',
      right: 'https://em-content.zobj.net/source/microsoft-teams/337/crystal-ball_1f52e.png'
    }
  },
  synthwave: {
    name: 'Synthwave',
    icon: '🎵',
    particleIcon: '💫',
    uploadIcon: 'https://em-content.zobj.net/source/microsoft-teams/337/musical-notes_1f3b6.png',
    headerIcons: {
      left: 'https://em-content.zobj.net/source/microsoft-teams/337/studio-microphone_1f399.png',
      right: 'https://em-content.zobj.net/source/microsoft-teams/337/headphone_1f3a7.png'
    }
  },
  galaxy: {
    name: 'Galaxy',
    icon: '🌌',
    particleIcon: '✨',
    uploadIcon: 'https://em-content.zobj.net/source/microsoft-teams/337/ringed-planet_1fa90.png',
    headerIcons: {
      left: 'https://em-content.zobj.net/source/microsoft-teams/337/comet_2604.png',
      right: 'https://em-content.zobj.net/source/microsoft-teams/337/milky-way_1f30c.png'
    }
  }
};

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFile, setConvertedFile] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('cyberpunk');
  const [showThemeList, setShowThemeList] = useState(false);

  // Parçacıklar için
  useEffect(() => {
    const createParticles = () => {
      const particles = Array.from({ length: 50 }).map((_, i) => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particle.style.width = `${Math.random() * 4 + 2}px`;
        particle.style.height = `${Math.random() * 4 + 2}px`;
        return particle;
      });

      document.body.append(...particles);
      return () => particles.forEach(p => p.remove());
    };

    const cleanup = createParticles();
    return cleanup;
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        setConvertedFile(null);
        setShowPreview(false);
      }
    },
  });

  const handleConvert = async () => {
    if (!selectedFile || !targetFormat) return;
    
    setIsConverting(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('target_format', targetFormat.toLowerCase());

    try {
      const response = await fetch('http://127.0.0.1:5000/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Dönüştürme başarısız');

      const blob = await response.blob();
      const fileUrl = URL.createObjectURL(blob);
      setConvertedFile(fileUrl);
      setShowPreview(true);
    } catch (error) {
      console.error('Dönüştürme hatası:', error);
      alert('Dönüştürme sırasında bir hata oluştu');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedFile) return;
    
    const link = document.createElement('a');
    link.href = convertedFile;
    link.download = `converted-file.${targetFormat.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatOptions = [
    'PDF',
    'DOCX',
    'PNG',
    'JPG',
    'MP3',
    'MP4',
  ];

  return (
    <main className={`min-h-screen py-12 px-4 theme-${currentTheme}`}>
      {/* Tema Seçici */}
      <div className="theme-selector">
        <button
          className="theme-button"
          onClick={() => setShowThemeList(!showThemeList)}
          title="Tema değiştir"
        />
        <div className={`theme-list ${showThemeList ? 'show' : ''}`}>
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              className="theme-option"
              onClick={() => {
                setCurrentTheme(key);
                setShowThemeList(false);
              }}
            >
              {theme.icon} {theme.name}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-float">
          <div className="flex justify-center items-center gap-4 mb-6">
            <img 
              src={themes[currentTheme].headerIcons.left}
              alt="Sol ikon"
              className="w-16 h-16 animate-pulse-scale element-glow"
            />
            <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
              Dosya Formatı
              <span className="shimmer-text"> Dönüştürücü</span>
            </h1>
            <img 
              src={themes[currentTheme].headerIcons.right}
              alt="Sağ ikon"
              className="w-16 h-16 animate-pulse-scale element-glow"
            />
          </div>
          <p className="text-xl opacity-80">
            {themes[currentTheme].name} Temalı Dosya Dönüştürücü {themes[currentTheme].particleIcon}
          </p>
        </div>

        {/* Ana Kart */}
        <div className="glass-effect rounded-3xl shadow-2xl p-8 md:p-10 element-glow themed-card">
          {/* Yükleme Alanı */}
          <div
            {...getRootProps()}
            className={`
              border-3 border-dashed rounded-2xl p-10 md:p-14 text-center cursor-pointer
              transition-all duration-300 ease-in-out hover-scale animate-pulse-scale
              ${isDragActive 
                ? 'border-[var(--primary)] bg-[var(--secondary)]/10' 
                : 'border-[var(--secondary)] hover:border-[var(--primary)] hover:bg-[var(--secondary)]/5'
              }
            `}
          >
            <input {...getInputProps()} />
            
            {/* Upload Icon */}
            <div className="mb-6 animate-float">
              <img 
                src={themes[currentTheme].uploadIcon}
                alt="Upload"
                className="w-24 h-24 mx-auto element-glow"
              />
            </div>

            {/* Upload Text */}
            <p className="text-2xl font-medium shimmer-text mb-3">
              {isDragActive 
                ? `${themes[currentTheme].particleIcon} Dosyayı Buraya Bırakın ${themes[currentTheme].particleIcon}` 
                : `${themes[currentTheme].icon} Dosya Seçin veya Sürükleyin ${themes[currentTheme].icon}`
              }
            </p>
            <p className="text-sm opacity-70">
              Tüm popüler dosya formatları desteklenir
            </p>

            {/* Selected File */}
            {selectedFile && (
              <div className="mt-6 inline-block bg-[var(--secondary)]/10 rounded-xl px-6 py-3 shadow-lg hover-scale">
                <p className="text-sm text-[var(--primary)] font-medium">
                  Seçilen dosya: {selectedFile.name}
                </p>
              </div>
            )}
          </div>

          {/* Format Seçici */}
          {selectedFile && (
            <div className="mt-10">
              <h3 className="text-lg font-medium shimmer-text mb-4">
                {themes[currentTheme].particleIcon} Hedef Format {themes[currentTheme].particleIcon}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {formatOptions.map((format) => (
                  <button
                    key={format}
                    onClick={() => setTargetFormat(format)}
                    className={`
                      themed-button
                      ${targetFormat === format ? 'opacity-100 scale-105' : 'opacity-70 hover:opacity-90'}
                    `}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dönüştür Butonu */}
          {selectedFile && targetFormat && (
            <button
              onClick={handleConvert}
              disabled={isConverting}
              className="mt-10 w-full py-5 px-8 rounded-xl text-xl font-medium
                gradient-bg element-glow hover-scale themed-button"
            >
              {isConverting ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Dönüştürülüyor...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  {themes[currentTheme].particleIcon} Dönüştür {themes[currentTheme].icon}
                </span>
              )}
            </button>
          )}

          {/* Sonuç */}
          {convertedFile && (
            <div className="mt-10 p-6 border-2 border-[var(--secondary)] rounded-2xl glass-effect animate-float">
              <h3 className="text-xl font-medium shimmer-text mb-4">
                {themes[currentTheme].particleIcon} Dönüştürülen Dosya {themes[currentTheme].icon}
              </h3>
              
              {/* Önizleme - Resim formatları için */}
              {['PNG', 'JPG'].includes(targetFormat) && (
                <div className="mb-6 rounded-xl overflow-hidden shadow-2xl hover-scale">
                  <img 
                    src={convertedFile} 
                    alt="Dönüştürülen dosya" 
                    className="max-w-full h-auto"
                  />
                </div>
              )}

              {/* İndirme Butonu */}
              <button
                onClick={handleDownload}
                className="w-full gradient-bg text-xl font-medium py-4 px-6 rounded-xl
                  transition-all duration-300 hover-scale element-glow themed-button
                  flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {themes[currentTheme].particleIcon} Dosyayı İndir {themes[currentTheme].icon}
              </button>
            </div>
          )}
        </div>

        {/* Desteklenen Formatlar */}
        <div className="mt-10 text-center">
          <div className="inline-block glass-effect rounded-full px-8 py-4 shadow-xl hover-scale themed-card">
            <p>
              Desteklenen formatlar: 
              <span className="font-medium ml-2 shimmer-text">
                PDF, DOCX, PNG, JPG, MP3, MP4
              </span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}