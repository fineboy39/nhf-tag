import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import nhfBg from "/nhf.png";
import swapLogo from "/swaplogo.png";

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
          text: `I'm thrilled and grateful to share that I've been selected as a National Health Fellow – Cohort II! 🙌💚\n\nJoin me in strengthening Primary Healthcare! - ${capitalizeName(name)} from ${capitalizeAll(lga)}, ${capitalizeAll(stateName)}\n\nGenerate yours: https://nhf-tag.vercel.app/`,
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
      background: "linear-gradient(145deg, #f0f4f8 0%, #e8eef5 100%)",
      padding: isMobile ? "16px" : "32px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: "relative",
    },
    mainCard: {
      maxWidth: "1200px",
      width: "100%",
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: isMobile ? "32px" : "48px",
      background: "white",
      borderRadius: isMobile ? "24px" : "32px",
      padding: isMobile ? "24px" : "48px",
      boxShadow: "0 20px 60px -15px rgba(0,0,0,0.2), 0 0 1px rgba(0,0,0,0.1)",
      border: "1px solid rgba(226, 232, 240, 0.8)",
    },
    leftSection: {
      paddingRight: isMobile ? "0" : "24px",
      borderRight: isMobile ? "none" : "2px solid #f1f5f9",
      order: isMobile ? 1 : 1,
    },
    rightSection: {
      display: "flex",
      flexDirection: "column",
      order: isMobile ? 2 : 2,
    },
    header: {
      marginBottom: isMobile ? "28px" : "36px",
      textAlign: isMobile ? "center" : "left",
    },
    title: {
      fontSize: isMobile ? "32px" : "42px",
      fontWeight: "800",
      background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #3b6bb5 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      marginBottom: "12px",
      letterSpacing: "-0.03em",
      lineHeight: 1.1,
    },
    subtitle: {
      color: "#64748b",
      fontSize: isMobile ? "14px" : "16px",
      fontWeight: "500",
      lineHeight: 1.6,
      letterSpacing: "-0.01em",
    },
    formGroup: {
      marginBottom: isMobile ? "20px" : "24px",
    },
    label: {
      display: "block",
      marginBottom: "10px",
      fontSize: isMobile ? "13px" : "14px",
      fontWeight: "700",
      color: "#1e293b",
      letterSpacing: "0.01em",
      textTransform: "uppercase",
      fontSize: "12px",
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
      height: isMobile ? "160px" : "200px",
      border: `3px dashed ${formErrors.image ? '#ef4444' : '#cbd5e0'}`,
      borderRadius: "20px",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      background: formErrors.image ? "#fef2f2" : "#f8fafc",
      overflow: "hidden",
      position: "relative",
    },
    uploadIcon: {
      fontSize: isMobile ? "40px" : "48px",
      marginBottom: "12px",
      filter: "grayscale(0.2)",
    },
    uploadText: {
      color: "#1e293b",
      fontSize: isMobile ? "15px" : "17px",
      fontWeight: "700",
      marginBottom: "6px",
      letterSpacing: "-0.01em",
    },
    uploadHint: {
      color: "#94a3b8",
      fontSize: isMobile ? "12px" : "13px",
      fontWeight: "500",
    },
    previewImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    input: {
      width: "100%",
      padding: isMobile ? "14px 18px" : "16px 20px",
      fontSize: isMobile ? "15px" : "16px",
      border: `2px solid ${formErrors.name || formErrors.lga || formErrors.state ? '#ef4444' : '#e2e8f0'}`,
      borderRadius: "14px",
      outline: "none",
      transition: "all 0.2s ease",
      background: "#ffffff",
      color: "#1e293b",
      fontFamily: "inherit",
      fontWeight: "500",
    },
    errorText: {
      color: "#ef4444",
      fontSize: "13px",
      marginTop: "8px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    // WhatsApp Status optimized card (9:16 aspect ratio) - Background more visible
    tagCard: {
      width: "100%",
      maxWidth: isMobile ? "360px" : "405px",
      margin: "0 auto",
      aspectRatio: "9/16",
      borderRadius: isMobile ? "20px" : "24px",
      overflow: "hidden",
      backgroundImage: `url(${nhfBg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25), 0 0 1px rgba(0,0,0,0.1)",
      transition: "transform 0.3s ease",
      marginBottom: isMobile ? "20px" : "28px",
      position: "relative",
      border: "1px solid rgba(255,255,255,0.2)",
    },
    tagCardContent: {
      background: "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.35) 100%)",
      backdropFilter: "blur(2px)",
      height: "100%",
      padding: isMobile ? "16px 12px 14px" : "20px 16px 18px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      position: "relative",
      zIndex: 1,
    },
    badge: {
      background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      padding: isMobile ? "6px 14px" : "8px 18px",
      borderRadius: "100px",
      marginBottom: isMobile ? "4px" : "6px",
      display: "inline-block",
      boxShadow: "0 8px 16px rgba(30,60,114,0.3)",
      border: "2px solid rgba(255,255,255,0.3)",
    },
    badgeText: {
      color: "white",
      fontSize: isMobile ? "11px" : "13px",
      fontWeight: "800",
      letterSpacing: "0.8px",
      textShadow: "0 2px 4px rgba(0,0,0,0.2)",
    },
    fellowTitle: {
      color: "#1e3c72",
      fontSize: isMobile ? "18px" : "22px",
      fontWeight: "900",
      marginBottom: "4px",
      letterSpacing: "-0.02em",
      textAlign: "center",
      lineHeight: 1.2,
      textShadow: "0 2px 4px rgba(255,255,255,0.9)",
    },
    profileImage: {
      width: isMobile ? "120px" : "140px",
      height: isMobile ? "120px" : "140px",
      borderRadius: "50%",
      objectFit: "cover",
      border: "4px solid white",
      boxShadow: "0 20px 40px -8px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.05)",
      transition: "transform 0.2s ease",
      margin: isMobile ? "4px 0" : "8px 0",
      filter: "brightness(1.03) contrast(1.05) saturate(1.05)",
    },
    announcementMessage: {
      background: "linear-gradient(135deg, rgba(30,60,114,0.18) 0%, rgba(42,82,152,0.18) 100%)",
      padding: isMobile ? "10px 12px" : "14px 16px",
      borderRadius: "16px",
      marginBottom: isMobile ? "8px" : "12px",
      textAlign: "center",
      border: "2px solid rgba(42,82,152,0.3)",
      width: "100%",
      backdropFilter: "blur(4px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    },
    announcementText: {
      fontSize: isMobile ? "12px" : "14px",
      fontWeight: "700",
      color: "#1e3c72",
      lineHeight: 1.4,
      marginBottom: "2px",
      textShadow: "0 1px 3px rgba(255,255,255,0.6)",
      letterSpacing: "-0.01em",
    },
    nameDisplay: {
      fontSize: isMobile ? "18px" : "22px",
      fontWeight: "800",
      color: "#0f172a",
      marginBottom: "4px",
      textAlign: "center",
      lineHeight: 1.2,
      textShadow: "0 2px 4px rgba(255,255,255,0.9)",
      wordBreak: "break-word",
      padding: "0 10px",
      letterSpacing: "-0.02em",
    },
    roleText: {
      fontSize: isMobile ? "11px" : "13px",
      color: "#334155",
      fontWeight: "700",
      marginBottom: "6px",
      textShadow: "0 1px 2px rgba(255,255,255,0.6)",
      letterSpacing: "-0.01em",
    },
    locationText: {
      fontSize: isMobile ? "12px" : "14px",
      color: "#ffffff",
      fontWeight: "800",
      background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      padding: isMobile ? "6px 16px" : "8px 20px",
      borderRadius: "100px",
      display: "inline-block",
      boxShadow: "0 8px 20px rgba(30,60,114,0.4)",
      border: "2px solid rgba(255,255,255,0.3)",
      letterSpacing: "0.5px",
      wordBreak: "break-word",
      maxWidth: "90%",
      textShadow: "0 2px 4px rgba(0,0,0,0.2)",
    },
    hashtags: {
      marginTop: isMobile ? "6px" : "8px",
      fontSize: isMobile ? "10px" : "11px",
      color: "#1e3c72",
      fontWeight: "700",
      letterSpacing: "0.3px",
      textShadow: "0 1px 2px rgba(255,255,255,0.6)",
      background: "rgba(255,255,255,0.6)",
      padding: isMobile ? "5px 12px" : "6px 14px",
      borderRadius: "100px",
      display: "inline-block",
      border: "1px solid rgba(42,82,152,0.2)",
    },
   developerCredit: {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: isMobile ? "4px" : "6px",
  fontSize: isMobile ? "8px" : "10px",
  color: "#475569",
  marginTop: isMobile ? "6px" : "8px",
  marginBottom: isMobile ? "6px" : "10px",
  fontWeight: "600",
  letterSpacing: "0.15px",
  background: "rgba(255,255,255,0.8)",
  padding: isMobile ? "4px 8px" : "6px 12px",
  borderRadius: "100px",
  backdropFilter: "blur(4px)",
  border: "1px solid rgba(71,85,105,0.15)",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  width: "auto",
  maxWidth: "95%",
},

    swapLogo: {
      height: isMobile ? "16px" : "18px",
      width: "auto",
      objectFit: "contain",
      filter: "brightness(0.95)",
    },
    swapLogoTop: {
      height: isMobile ? "28px" : "32px",
      width: "auto",
      objectFit: "contain",
      marginBottom: isMobile ? "8px" : "10px",
      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
    },
    topLogoSection: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: isMobile ? "4px" : "6px",
      marginBottom: isMobile ? "6px" : "8px",
      width: "100%",
    },
    profileSection: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: isMobile ? "4px" : "6px",
    },
    swapLogoBadge: {
      position: "absolute",
      bottom: isMobile ? "0px" : "5px",
      right: isMobile ? "calc(50% - 75px)" : "calc(50% - 85px)",
      background: "white",
      borderRadius: "50%",
      padding: isMobile ? "6px" : "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      border: "3px solid white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
    swapLogoProfile: {
      height: isMobile ? "32px" : "36px",
      width: isMobile ? "32px" : "36px",
      objectFit: "contain",
    },
    creditText: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "2px",
    },
    developerName: {
      fontWeight: "700",
      color: "#1e293b",
    },
    socialHandles: {
      display: "flex",
      gap: isMobile ? "4px" : "6px",
      alignItems: "center",
      fontSize: isMobile ? "7px" : "9px",
      color: "#64748b",
      fontWeight: "600",
      marginTop: "2px",
      flexWrap: "wrap",
      justifyContent: "center",
      maxWidth: "100%",
    },
    socialLink: {
      display: "flex",
      alignItems: "center",
      gap: isMobile ? "1px" : "2px",
      textDecoration: "none",
      color: "inherit",
      padding: isMobile ? "2px 5px" : "3px 6px",
      background: "rgba(255,255,255,0.6)",
      borderRadius: "100px",
      border: "1px solid rgba(100,116,139,0.2)",
      transition: "all 0.2s ease",
      fontSize: isMobile ? "7px" : "8px",
      fontWeight: "600",
      whiteSpace: "nowrap",
    },
    buttonGroup: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: isMobile ? "12px" : "14px",
      marginTop: isMobile ? "20px" : "auto",
    },
    button: {
      flex: 1,
      padding: isMobile ? "16px 24px" : "18px 28px",
      border: "none",
      borderRadius: "16px",
      fontSize: isMobile ? "15px" : "16px",
      fontWeight: "700",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      fontFamily: "inherit",
      width: "100%",
      letterSpacing: "-0.01em",
      position: "relative",
      overflow: "hidden",
    },
    whatsappButton: {
      background: "linear-gradient(135deg, #25D366 0%, #20ba5a 100%)",
      color: "white",
      boxShadow: "0 8px 20px rgba(37,211,102,0.3)",
      border: "2px solid rgba(255,255,255,0.3)",
    },
    downloadButton: {
      background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      color: "white",
      boxShadow: "0 8px 20px rgba(42,82,152,0.35)",
      border: "2px solid rgba(255,255,255,0.3)",
    },
    successMessage: {
      position: "fixed",
      top: isMobile ? "20px" : "32px",
      right: isMobile ? "20px" : "32px",
      left: isMobile ? "20px" : "auto",
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      color: "white",
      padding: isMobile ? "14px 24px" : "18px 32px",
      borderRadius: "100px",
      fontSize: isMobile ? "14px" : "16px",
      fontWeight: "700",
      boxShadow: "0 12px 32px -8px rgba(16,185,129,0.5)",
      animation: "slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      border: "2px solid rgba(255,255,255,0.3)",
    },
    inputRow: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: isMobile ? "16px" : "16px",
      marginBottom: "24px",
    },
    previewLabel: {
      fontSize: isMobile ? "14px" : "15px",
      fontWeight: "700",
      color: "#1e293b",
      marginBottom: "16px",
      textAlign: isMobile ? "center" : "left",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      fontSize: "12px",
    },
    validationSummary: {
      textAlign: "center",
      color: "#dc2626",
      fontSize: isMobile ? "13px" : "14px",
      marginTop: "18px",
      background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
      padding: isMobile ? "12px 16px" : "14px 20px",
      borderRadius: "14px",
      fontWeight: "600",
      border: "2px solid #fecaca",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },
  };

  return (
    <div style={styles.container}>
      {showSuccess && (
        <div style={styles.successMessage}>
          <span style={{ fontSize: "20px" }}>✓</span> 
          <span>Tag generated successfully!</span>
        </div>
      )}

      <div style={styles.mainCard}>
        {/* Left Section - Form */}
        <div style={styles.leftSection}>
          <div style={styles.header}>
            <h1 style={styles.title}>Create Your<br />NHF Identity Tag</h1>
            <p style={styles.subtitle}>
              Perfect for WhatsApp Status • Optimized 9:16 format • Fill in your details below
            </p>
          </div>

          {/* Form Fields */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Profile Photo *</label>
            <div style={styles.uploadArea}>
              <label
                style={styles.uploadLabel}
                onMouseEnter={(e) => {
                  if (!formErrors.image) {
                    e.currentTarget.style.borderColor = "#2a5298";
                    e.currentTarget.style.background = "#eff6ff";
                    e.currentTarget.style.transform = "scale(1.01)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = formErrors.image ? '#ef4444' : '#cbd5e0';
                  e.currentTarget.style.background = formErrors.image ? "#fef2f2" : "#f8fafc";
                  e.currentTarget.style.transform = "scale(1)";
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
                    <span style={styles.uploadHint}>PNG, JPG • Max 5MB</span>
                  </>
                )}
              </label>
            </div>
            {formErrors.image && (
              <div style={styles.errorText}>
                <span>⚠️</span>
                {formErrors.image}
              </div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              placeholder="e.g., Dr. Ahmed Sani"
              style={styles.input}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#2a5298";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(42,82,152,0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = formErrors.name ? '#ef4444' : '#e2e8f0';
                e.currentTarget.style.boxShadow = "none";
                handleNameBlur();
              }}
            />
            {formErrors.name && (
              <div style={styles.errorText}>
                <span>⚠️</span>
                {formErrors.name}
              </div>
            )}
          </div>

          <div style={styles.inputRow}>
            <div>
              <label style={styles.label}>LGA *</label>
              <input
                type="text"
                value={lga}
                onChange={handleLgaChange}
                onBlur={handleLgaBlur}
                placeholder="e.g., KANO MUNICIPAL"
                style={styles.input}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#2a5298";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(42,82,152,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = formErrors.lga ? '#ef4444' : '#e2e8f0';
                  e.currentTarget.style.boxShadow = "none";
                  handleLgaBlur();
                }}
              />
              {formErrors.lga && (
                <div style={styles.errorText}>
                  <span>⚠️</span>
                  {formErrors.lga}
                </div>
              )}
            </div>

            <div>
              <label style={styles.label}>State *</label>
              <input
                type="text"
                value={stateName}
                onChange={handleStateChange}
                onBlur={handleStateBlur}
                placeholder="e.g., KANO"
                style={styles.input}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#2a5298";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(42,82,152,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = formErrors.state ? '#ef4444' : '#e2e8f0';
                  e.currentTarget.style.boxShadow = "none";
                  handleStateBlur();
                }}
              />
              {formErrors.state && (
                <div style={styles.errorText}>
                  <span>⚠️</span>
                  {formErrors.state}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Tag Preview */}
        <div style={styles.rightSection}>
          <div style={styles.previewLabel}>
            📱 Live Preview
          </div>
          
          {/* Tag Card */}
          <div ref={cardRef} style={styles.tagCard}>
            <div style={styles.tagCardContent}>
              {/* Developer Credit - Top */}
              <div style={{
                width: "100%",
                textAlign: "center",
                marginBottom: isMobile ? "4px" : "6px",
              }}>
                <div style={{
                  display: "inline-block",
                  background: "rgba(255,255,255,0.85)",
                  padding: isMobile ? "4px 10px" : "5px 12px",
                  borderRadius: "100px",
                  fontSize: isMobile ? "7px" : "8px",
                  color: "#475569",
                  fontWeight: "600",
                  border: "1px solid rgba(71,85,105,0.15)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                }}>
                  Developed by <span style={{ fontWeight: "700", color: "#1e293b" }}>Shamsu Nafiu</span> (Cohort II - Jigawa)
                </div>
              </div>

              {/* Top Section */}
              <div style={styles.topLogoSection}>
                <div style={styles.badge}>
                  <span style={styles.badgeText}>🇳🇬 NHF COHORT II</span>
                </div>
                <h2 style={styles.fellowTitle}>National Health<br />Fellow</h2>
              </div>

              {/* Profile Section with Logo Badge */}
              <div style={styles.profileSection}>
                {image ? (
                  <>
                    <img
                      src={image}
                      alt="Profile"
                      style={styles.profileImage}
                    />
                    <div style={styles.swapLogoBadge}>
                      <img 
                        src={swapLogo} 
                        alt="Swap" 
                        style={styles.swapLogoProfile}
                      />
                    </div>
                  </>
                ) : (
                  <div style={{
                    width: isMobile ? "120px" : "140px",
                    height: isMobile ? "120px" : "140px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "4px solid white",
                    boxShadow: "0 20px 40px -8px rgba(0,0,0,0.15)",
                    margin: isMobile ? "4px 0" : "8px 0",
                    position: "relative",
                  }}>
                    <span style={{ fontSize: "40px", opacity: 0.3 }}>👤</span>
                    <div style={styles.swapLogoBadge}>
                      <img 
                        src={swapLogo} 
                        alt="Swap" 
                        style={styles.swapLogoProfile}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={styles.announcementMessage}>
                <p style={styles.announcementText}>
                  I'm thrilled and grateful to share that I've been selected as a National Health Fellow – Cohort II! 🙌💚
                </p>
              </div>

              <div style={{ textAlign: "center", width: "100%", marginBottom: "-2px" }}>
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

              <div style={{ textAlign: "center", width: "100%", marginTop: "-4px" }}>
                <div style={styles.hashtags}>
                  #NHFCohortII #PrimaryHealthcare
                </div>
                
                <div style={styles.developerCredit}>
                  <div style={styles.creditText}>
                    <span style={{ fontSize: isMobile ? "7px" : "9px" }}>
                      Developed by <span style={styles.developerName}>Shamsu Nafiu</span> (Cohort II - Jigawa)
                    </span>
                    <div style={styles.socialHandles}>
                      <span style={styles.socialLink}>
                        𝕏 @swapng
                      </span>
                      <span style={styles.socialLink}>
                        📘 @swapng
                      </span>
                      <span style={styles.socialLink}>
                        📷 @swap.ng
                      </span>
                      <span style={styles.socialLink}>
                        🎵 @swap.ng
                      </span>
                    </div>
                  </div>
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
                opacity: isGenerating ? 0.6 : 1,
                cursor: isGenerating ? "not-allowed" : "pointer",
              }}
              disabled={isGenerating}
              onMouseEnter={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
                  e.currentTarget.style.boxShadow = "0 12px 28px rgba(37,211,102,0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(37,211,102,0.3)";
              }}
            >
              {isGenerating ? (
                <>
                  <span style={{ fontSize: "20px" }}>⏳</span> 
                  Generating...
                </>
              ) : (
                <>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
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
                opacity: isGenerating ? 0.6 : 1,
                cursor: isGenerating ? "not-allowed" : "pointer",
              }}
              disabled={isGenerating}
              onMouseEnter={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
                  e.currentTarget.style.boxShadow = "0 12px 28px rgba(42,82,152,0.45)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(42,82,152,0.35)";
              }}
            >
              {isGenerating ? (
                <>
                  <span style={{ fontSize: "20px" }}>⏳</span> 
                  Generating...
                </>
              ) : (
                <>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                  </svg>
                  Download Image
                </>
              )}
            </button>
          </div>

          {/* Validation Summary */}
          {(Object.keys(formErrors).length > 0) && (
            <div style={styles.validationSummary}>
              <span style={{ fontSize: "18px" }}>⚠️</span>
              <span>Please fill in all required fields</span>
            </div>
          )}

          {/* Social Media Links Section */}
          <div style={{
            marginTop: isMobile ? "20px" : "24px",
            padding: isMobile ? "16px" : "20px",
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            borderRadius: "16px",
            border: "2px solid #e2e8f0",
            textAlign: "center",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "12px",
            }}>
              <img 
                src={swapLogo} 
                alt="Swap Logo" 
                style={{
                  height: isMobile ? "24px" : "28px",
                  width: "auto",
                }}
              />
              <span style={{
                fontSize: isMobile ? "14px" : "16px",
                fontWeight: "700",
                color: "#1e293b",
              }}>
                Follow Swap on Social Media
              </span>
            </div>
            <div style={{
              display: "flex",
              gap: isMobile ? "8px" : "10px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}>
              <a 
                href="https://twitter.com/swapng" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: isMobile ? "8px 14px" : "10px 16px",
                  background: "white",
                  borderRadius: "12px",
                  textDecoration: "none",
                  color: "#1e293b",
                  fontSize: isMobile ? "13px" : "14px",
                  fontWeight: "600",
                  border: "2px solid #e2e8f0",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                  e.currentTarget.style.borderColor = "#2a5298";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                }}
              >
                <span style={{ fontSize: "16px" }}>𝕏</span> X (Twitter)
              </a>
              
              <a 
                href="https://facebook.com/swapng" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: isMobile ? "8px 14px" : "10px 16px",
                  background: "white",
                  borderRadius: "12px",
                  textDecoration: "none",
                  color: "#1e293b",
                  fontSize: isMobile ? "13px" : "14px",
                  fontWeight: "600",
                  border: "2px solid #e2e8f0",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                  e.currentTarget.style.borderColor = "#2a5298";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                }}
              >
                <span style={{ fontSize: "16px" }}>📘</span> Facebook
              </a>
              
              <a 
                href="https://instagram.com/swap.ng" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: isMobile ? "8px 14px" : "10px 16px",
                  background: "white",
                  borderRadius: "12px",
                  textDecoration: "none",
                  color: "#1e293b",
                  fontSize: isMobile ? "13px" : "14px",
                  fontWeight: "600",
                  border: "2px solid #e2e8f0",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                  e.currentTarget.style.borderColor = "#2a5298";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                }}
              >
                <span style={{ fontSize: "16px" }}>📷</span> Instagram
              </a>
              
              <a 
                href="https://tiktok.com/@swap.ng" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: isMobile ? "8px 14px" : "10px 16px",
                  background: "white",
                  borderRadius: "12px",
                  textDecoration: "none",
                  color: "#1e293b",
                  fontSize: isMobile ? "13px" : "14px",
                  fontWeight: "600",
                  border: "2px solid #e2e8f0",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                  e.currentTarget.style.borderColor = "#2a5298";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                }}
              >
                <span style={{ fontSize: "16px" }}>🎵</span> TikTok
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </div>
  );
}
