import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import nhfBg from "/nhf.png";

export default function TagCard() {
  const cardRef = useRef();
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [lga, setLga] = useState("");
  const [stateName, setStateName] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Check screen size for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-capitalize function for name (capitalizes first letter of each word)
  const capitalizeName = (str) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  };

  // Auto-capitalize function for LGA and State (capitalizes all letters)
  const capitalizeAll = (str) => {
    return str.toUpperCase();
  };

  // Handle input changes with auto-capitalization
  const handleNameChange = (e) => {
    const input = e.target.value;
    setName(input);
  };

  const handleLgaChange = (e) => {
    const input = e.target.value;
    setLga(input);
  };

  const handleStateChange = (e) => {
    const input = e.target.value;
    setStateName(input);
  };

  // Capitalize on blur
  const handleNameBlur = () => {
    setName(capitalizeName(name));
  };

  const handleLgaBlur = () => {
    setLga(capitalizeAll(lga));
  };

  const handleStateBlur = () => {
    setStateName(capitalizeAll(stateName));
  };

  // Handle image upload with preview and validation
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        alert("Please upload an image file");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImage(reader.result);
        setFormErrors(prev => ({ ...prev, image: null }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    if (!image) errors.image = "Photo is required";
    if (!name.trim()) errors.name = "Name is required";
    if (!lga.trim()) errors.lga = "LGA is required";
    if (!stateName.trim()) errors.state = "State is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Generate Image File with loading state
  const generateImageFile = async () => {
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: null,
        allowTaint: true,
        useCORS: true,
        logging: false,
      });
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          const file = new File([blob], `nhf-tag-${name.replace(/\s+/g, '-').toLowerCase()}.png`, {
            type: "image/png",
          });
          setIsGenerating(false);
          resolve(file);
        }, 'image/png', 1);
      });
    } catch (error) {
      console.error("Error generating image:", error);
      setIsGenerating(false);
      throw error;
    }
  };

  // Share to WhatsApp as Image
  const shareToWhatsApp = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const file = await generateImageFile();

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "NHF Cohort II Selection Announcement",
          text: `I'm thrilled and grateful to share that I've been selected as a National Health Fellow – Cohort II! 🙌💚\n\nJoin me in strengthening Primary Healthcare! - ${capitalizeName(name)} from ${capitalizeAll(lga)}, ${capitalizeAll(stateName)}`,
        });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        await downloadImage();
      }
    } catch (error) {
      console.log("Sharing cancelled or failed:", error);
    }
  };

  // Download fallback
  const downloadImage = async () => {
    if (!validateForm()) {
      return;
    }

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: null,
        allowTaint: true,
        useCORS: true,
      });
      
      const link = document.createElement("a");
      link.download = `nhf-tag-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error downloading image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Clear preview when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(145deg, #f8fafc 0%, #eef2f6 100%)",
      padding: isMobile ? "12px" : "24px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    mainCard: {
      maxWidth: "1200px",
      width: "100%",
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: isMobile ? "24px" : "40px",
      background: "white",
      borderRadius: isMobile ? "32px" : "48px",
      padding: isMobile ? "20px" : "40px",
      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    },
    leftSection: {
      paddingRight: isMobile ? "0" : "40px",
      borderRight: isMobile ? "none" : "1px solid #e9eef2",
      order: isMobile ? 2 : 1,
    },
    rightSection: {
      display: "flex",
      flexDirection: "column",
      order: isMobile ? 1 : 2,
    },
    header: {
      marginBottom: isMobile ? "24px" : "32px",
      textAlign: isMobile ? "center" : "left",
    },
    title: {
      fontSize: isMobile ? "28px" : "36px",
      fontWeight: "800",
      background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      marginBottom: "12px",
      letterSpacing: "-0.02em",
      lineHeight: 1.2,
    },
    subtitle: {
      color: "#5b6775",
      fontSize: isMobile ? "14px" : "16px",
      fontWeight: "400",
      lineHeight: 1.6,
    },
    formGroup: {
      marginBottom: isMobile ? "20px" : "24px",
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontSize: isMobile ? "13px" : "14px",
      fontWeight: "600",
      color: "#2d3a4a",
      letterSpacing: "0.02em",
    },
    uploadArea: {
      marginBottom: isMobile ? "20px" : "24px",
    },
    uploadLabel: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: isMobile ? "150px" : "180px",
      border: `2px dashed ${formErrors.image ? '#ef4444' : '#cbd5e0'}`,
      borderRadius: "24px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      background: "#f8fafc",
      overflow: "hidden",
      position: "relative",
    },
    uploadIcon: {
      fontSize: isMobile ? "36px" : "40px",
      color: "#2a5298",
      marginBottom: "12px",
    },
    uploadText: {
      color: "#2d3a4a",
      fontSize: isMobile ? "14px" : "16px",
      fontWeight: "600",
      marginBottom: "4px",
    },
    uploadHint: {
      color: "#8b9aab",
      fontSize: isMobile ? "12px" : "13px",
    },
    previewImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    input: {
      width: "100%",
      padding: isMobile ? "12px 16px" : "14px 18px",
      fontSize: isMobile ? "14px" : "15px",
      border: `2px solid ${formErrors.name || formErrors.lga || formErrors.state ? '#ef4444' : '#e2e8f0'}`,
      borderRadius: "16px",
      outline: "none",
      transition: "all 0.2s ease",
      background: "#f8fafc",
      color: "#1e293b",
      fontFamily: "inherit",
    },
    errorText: {
      color: "#ef4444",
      fontSize: "12px",
      marginTop: "6px",
      fontWeight: "500",
    },
    // WhatsApp Status optimized card (9:16 aspect ratio)
    tagCard: {
      width: "100%",
      maxWidth: isMobile ? "320px" : "100%",
      margin: "0 auto",
      aspectRatio: "9/16",
      borderRadius: isMobile ? "28px" : "32px",
      overflow: "hidden",
      backgroundImage: `url(${nhfBg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      boxShadow: "0 20px 35px -8px rgba(0,0,0,0.3)",
      transition: "transform 0.3s ease",
      marginBottom: isMobile ? "16px" : "24px",
      position: "relative",
    },
    tagCardContent: {
      background: "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.6) 100%)",
      backdropFilter: "blur(2px)",
      height: "100%",
      padding: isMobile ? "16px 12px" : "24px 16px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      position: "relative",
      zIndex: 1,
    },
    badge: {
      background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      padding: isMobile ? "6px 12px" : "8px 16px",
      borderRadius: "100px",
      marginBottom: isMobile ? "4px" : "8px",
      display: "inline-block",
      boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
    },
    badgeText: {
      color: "white",
      fontSize: isMobile ? "12px" : "14px",
      fontWeight: "700",
      letterSpacing: "0.5px",
      textShadow: "0 1px 2px rgba(0,0,0,0.2)",
    },
    fellowTitle: {
      color: "#1e3c72",
      fontSize: isMobile ? "20px" : "24px",
      fontWeight: "800",
      marginBottom: "4px",
      letterSpacing: "-0.01em",
      textAlign: "center",
      lineHeight: 1.2,
      textShadow: "0 1px 3px rgba(255,255,255,0.8)",
    },
    profileImage: {
      width: isMobile ? "140px" : "180px",
      height: isMobile ? "140px" : "180px",
      borderRadius: "50%",
      objectFit: "cover",
      border: "4px solid white",
      boxShadow: "0 15px 30px -5px rgba(0,0,0,0.3)",
      transition: "transform 0.2s ease",
      margin: isMobile ? "8px 0" : "16px 0",
      filter: "brightness(1.02) contrast(1.02)",
    },
    announcementMessage: {
      background: "linear-gradient(135deg, rgba(30,60,114,0.15) 0%, rgba(42,82,152,0.15) 100%)",
      padding: isMobile ? "10px 12px" : "14px 18px",
      borderRadius: "24px",
      marginBottom: isMobile ? "12px" : "16px",
      textAlign: "center",
      border: "1px solid rgba(42,82,152,0.25)",
      width: "100%",
      backdropFilter: "blur(2px)",
      boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
    },
    announcementText: {
      fontSize: isMobile ? "13px" : "15px",
      fontWeight: "600",
      color: "#1e3c72",
      lineHeight: 1.5,
      marginBottom: "2px",
      textShadow: "0 1px 2px rgba(255,255,255,0.5)",
    },
    nameDisplay: {
      fontSize: isMobile ? "20px" : "24px",
      fontWeight: "700",
      color: "#1e293b",
      marginBottom: "4px",
      textAlign: "center",
      lineHeight: 1.2,
      textShadow: "0 1px 3px rgba(255,255,255,0.8)",
      wordBreak: "break-word",
      padding: "0 8px",
    },
    roleText: {
      fontSize: isMobile ? "12px" : "14px",
      color: "#2d3a4a",
      fontWeight: "600",
      marginBottom: "6px",
      textShadow: "0 1px 2px rgba(255,255,255,0.5)",
    },
    locationText: {
      fontSize: isMobile ? "13px" : "15px",
      color: "#ffffff",
      fontWeight: "700",
      background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      padding: isMobile ? "6px 16px" : "8px 20px",
      borderRadius: "100px",
      display: "inline-block",
      boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
      border: "1px solid rgba(255,255,255,0.3)",
      letterSpacing: "0.5px",
      wordBreak: "break-word",
      maxWidth: "90%",
    },
    hashtags: {
      marginTop: isMobile ? "8px" : "12px",
      fontSize: isMobile ? "10px" : "12px",
      color: "#1e3c72",
      fontWeight: "600",
      letterSpacing: "0.3px",
      textShadow: "0 1px 2px rgba(255,255,255,0.5)",
      background: "rgba(255,255,255,0.5)",
      padding: isMobile ? "4px 12px" : "6px 16px",
      borderRadius: "100px",
      display: "inline-block",
    },
    developerCredit: {
      fontSize: isMobile ? "9px" : "10px",
      color: "#4a5568",
      marginTop: "6px",
      textAlign: "center",
      fontWeight: "500",
      letterSpacing: "0.3px",
      background: "rgba(255,255,255,0.3)",
      padding: "4px 12px",
      borderRadius: "100px",
      display: "inline-block",
      backdropFilter: "blur(2px)",
    },
    buttonGroup: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: isMobile ? "10px" : "12px",
      marginTop: "auto",
    },
    button: {
      flex: 1,
      padding: isMobile ? "14px 20px" : "16px 24px",
      border: "none",
      borderRadius: "18px",
      fontSize: isMobile ? "14px" : "15px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      fontFamily: "inherit",
      width: "100%",
    },
    whatsappButton: {
      background: "#25D366",
      color: "white",
      boxShadow: "0 4px 12px rgba(37,211,102,0.2)",
    },
    downloadButton: {
      background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      color: "white",
      boxShadow: "0 4px 12px rgba(42,82,152,0.3)",
    },
    successMessage: {
      position: "fixed",
      top: isMobile ? "16px" : "24px",
      right: isMobile ? "16px" : "24px",
      left: isMobile ? "16px" : "auto",
      background: "#10b981",
      color: "white",
      padding: isMobile ? "12px 20px" : "16px 28px",
      borderRadius: "100px",
      fontSize: isMobile ? "13px" : "15px",
      fontWeight: "500",
      boxShadow: "0 10px 25px -5px rgba(16,185,129,0.4)",
      animation: "slideIn 0.3s ease",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },
    inputRow: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: isMobile ? "12px" : "12px",
      marginBottom: "24px",
    },
  };

  return (
    <div style={styles.container}>
      {showSuccess && (
        <div style={styles.successMessage}>
          <span>✓</span> Tag generated and saved successfully!
        </div>
      )}

      <div style={styles.mainCard}>
        {/* Left Section - Form */}
        <div style={styles.leftSection}>
          <div style={styles.header}>
            <h1 style={styles.title}>Create Your<br />NHF Identity Tag</h1>
            <p style={styles.subtitle}>
              Perfect for WhatsApp Status (9:16). Fill in your details below.
            </p>
          </div>

          {/* Form Fields */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Profile Photo</label>
            <div style={styles.uploadArea}>
              <label
                style={styles.uploadLabel}
                onMouseEnter={(e) => {
                  if (!formErrors.image) {
                    e.currentTarget.style.borderColor = "#2a5298";
                    e.currentTarget.style.background = "#f0f4fa";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = formErrors.image ? '#ef4444' : '#cbd5e0';
                  e.currentTarget.style.background = "#f8fafc";
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={styles.previewImage} />
                ) : (
                  <>
                    <span style={styles.uploadIcon}>📸</span>
                    <span style={styles.uploadText}>Click to upload photo</span>
                    <span style={styles.uploadHint}>PNG, JPG up to 5MB</span>
                  </>
                )}
              </label>
            </div>
            {formErrors.image && (
              <div style={styles.errorText}>{formErrors.image}</div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name (Auto-capitalized)</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              placeholder="e.g., Dr. Ahmed Sani"
              style={styles.input}
              onFocus={(e) => e.currentTarget.style.borderColor = "#2a5298"}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = formErrors.name ? '#ef4444' : '#e2e8f0';
                handleNameBlur();
              }}
            />
            {formErrors.name && (
              <div style={styles.errorText}>{formErrors.name}</div>
            )}
          </div>

          <div style={styles.inputRow}>
            <div>
              <label style={styles.label}>LGA (Auto-capitalized)</label>
              <input
                type="text"
                value={lga}
                onChange={handleLgaChange}
                onBlur={handleLgaBlur}
                placeholder="e.g., KANO MUNICIPAL"
                style={styles.input}
                onFocus={(e) => e.currentTarget.style.borderColor = "#2a5298"}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = formErrors.lga ? '#ef4444' : '#e2e8f0';
                  handleLgaBlur();
                }}
              />
              {formErrors.lga && (
                <div style={styles.errorText}>{formErrors.lga}</div>
              )}
            </div>

            <div>
              <label style={styles.label}>State (Auto-capitalized)</label>
              <input
                type="text"
                value={stateName}
                onChange={handleStateChange}
                onBlur={handleStateBlur}
                placeholder="e.g., KANO"
                style={styles.input}
                onFocus={(e) => e.currentTarget.style.borderColor = "#2a5298"}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = formErrors.state ? '#ef4444' : '#e2e8f0';
                  handleStateBlur();
                }}
              />
              {formErrors.state && (
                <div style={styles.errorText}>{formErrors.state}</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Preview */}
        <div style={styles.rightSection}>
          <label style={{ ...styles.label, marginBottom: "16px", textAlign: isMobile ? "center" : "left" }}>
            Preview (WhatsApp Status Size)
          </label>
          
          {/* Tag Card */}
          <div ref={cardRef} style={styles.tagCard}>
            <div style={styles.tagCardContent}>
              <div style={{ width: "100%", textAlign: "center" }}>
                <div style={styles.badge}>
                  <span style={styles.badgeText}>🇳🇬 NHF COHORT II</span>
                </div>
                <h2 style={styles.fellowTitle}>National Health<br />Fellow</h2>
              </div>

              {image && (
                <img
                  src={image}
                  alt="Profile"
                  style={styles.profileImage}
                />
              )}

              <div style={styles.announcementMessage}>
                <p style={styles.announcementText}>
                  I'm thrilled and grateful to share that I've been selected as a National Health Fellow – Cohort II! 🙌💚
                </p>
              </div>

              <div style={{ textAlign: "center", width: "100%" }}>
                <h3 style={styles.nameDisplay}>
                  {capitalizeName(name) || "Your Name"}
                </h3>
                <p style={styles.roleText}>
                  Strengthening Primary Healthcare
                </p>
                {(lga || stateName) && (
                  <p style={styles.locationText}>
                    {capitalizeAll(lga)}{lga && stateName ? ", " : ""}{capitalizeAll(stateName)}
                  </p>
                )}
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={styles.hashtags}>
                  #NHFCohortII #PrimaryHealthcare
                </div>
                <div style={styles.developerCredit}>
                  Developed by Shamsu Nafiu • NHF Cohort II
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={styles.buttonGroup}>
            <button
              onClick={shareToWhatsApp}
              style={{
                ...styles.button,
                ...styles.whatsappButton,
                opacity: isGenerating ? 0.7 : 1,
                cursor: isGenerating ? "not-allowed" : "pointer",
              }}
              disabled={isGenerating}
              onMouseEnter={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(37,211,102,0.3)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,211,102,0.2)";
              }}
            >
              {isGenerating ? (
                <>⏳ Generating...</>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.32a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.24-8.22 8.24z"/>
                  </svg>
                  Share to WhatsApp
                </>
              )}
            </button>

            <button
              onClick={downloadImage}
              style={{
                ...styles.button,
                ...styles.downloadButton,
                opacity: isGenerating ? 0.7 : 1,
                cursor: isGenerating ? "not-allowed" : "pointer",
              }}
              disabled={isGenerating}
              onMouseEnter={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(42,82,152,0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(42,82,152,0.3)";
              }}
            >
              {isGenerating ? (
                <>⏳ Generating...</>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                  </svg>
                  Download Image
                </>
              )}
            </button>
          </div>

          {/* Validation Summary */}
          {(Object.keys(formErrors).length > 0) && (
            <p style={{
              textAlign: "center",
              color: "#ef4444",
              fontSize: isMobile ? "12px" : "13px",
              marginTop: "16px",
              background: "#fef2f2",
              padding: isMobile ? "10px" : "12px",
              borderRadius: "12px",
            }}>
              ⚠️ Please fill in all required fields
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  );
}