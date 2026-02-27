import React, { useState } from "react";
import { bannerStyles, customStyles } from "../assets/dummyStyles";
import { floatingIcons } from "../assets/dummyBanner";
import { CircleCheckBig, Sparkle, X } from "lucide-react";
import bannerImg from "../assets/Bannerimage.jpg";
import video from "../assets/BannerVideo.mp4";

const features = [
  { text: "Modern UI Components", color: "sky" },
  { text: "Fully Responsive", color: "emerald" },
  { text: "Fast Performance", color: "violet" },
];

const colorMap = {
  sky: "text-sky-500",
  emerald: "text-emerald-500",
  violet: "text-violet-500",
};

const Banner = () => {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className={bannerStyles.container}>
      {/* Floating Icons */}
      <div className={bannerStyles.floatingIconsWrapper}>
        {floatingIcons.map((icon, i) => (
          <img
            key={i}
            src={icon.src}
            alt={icon.alt || ""}
            className={`${bannerStyles.floatingIcon} ${icon.pos}`}
            style={{ animationDelay: `${i * 0.35}s` }}
          />
        ))}
      </div>

      <div className={bannerStyles.mainContent}>
        <div className={bannerStyles.grid}>
          <div className={bannerStyles.leftContent}>
            <span className={bannerStyles.badge}>
              <Sparkle className={bannerStyles.badgeIcon} />
              New Features Available
            </span>

            <h1 className={bannerStyles.heading}>
              <span className={bannerStyles.headingSpan1}>Build Amazing</span>
              <span className={bannerStyles.headingSpan2}>
                Digital Products
              </span>
            </h1>

            <p className={bannerStyles.description}>
              Create beautiful, responsive web applications with our powerful
              tools and components.
            </p>

            {/* Features */}
            <div className={bannerStyles.featuresGrid}>
              {features.map((feature, i) => (
                <div key={i} className={bannerStyles.featureItem}>
                  <span
                    className={`${bannerStyles.featureIcon} ${colorMap[feature.color]}`}
                  >
                    <CircleCheckBig size={16} />
                  </span>
                  <span className={bannerStyles.featureText}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className={bannerStyles.buttonsContainer}>
              <a href="/courses" className={bannerStyles.buttonGetStarted}>
                Get Started
              </a>

              <button
                className={bannerStyles.buttonViewDemo}
                onClick={() => setShowVideo(true)}
              >
                View Demo
              </button>
            </div>
          </div>

          {/* Image */}
          <div className={bannerStyles.imageContainer}>
            <img src={bannerImg} alt="banner" className={bannerStyles.image} />
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideo && (
        <div className={bannerStyles.videoModal.overlay}>
          <div className={bannerStyles.videoModal.container}>
            <video
              src={video}
              controls
              autoPlay
              className={bannerStyles.videoModal.iframe}
            />
            <button
              onClick={() => setShowVideo(false)}
              className={bannerStyles.videoModal.closeButton}
            >
              <X className={bannerStyles.videoModal.closeIcon} />
            </button>
          </div>
        </div>
      )}

      <style>{customStyles}</style>
    </div>
  );
};

export default Banner;
