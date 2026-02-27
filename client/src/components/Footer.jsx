import {
  footerStyles,
  footerBackgroundStyles,
  contactIconGradients,
  iconColors,
  footerCustomStyles,
} from "../assets/dummyStyles";

import {
  socialIcons,
  quickLinks,
  supportLinks,
  contactInfo,
} from "../assets/dummyFooter";

import logo from "../assets/logo.png";
import {
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  BookOpen,
  Users,
  FileText,
  HelpCircle,
  Shield,
  HelpingHand,
} from "lucide-react";

const iconMap = {
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  BookOpen,
  Users,
  FileText,
  HelpCircle,
  Shield,
  HelpingHand,
};

const Footer = () => {
  return (
    <footer className={footerStyles.footer}>
      {/* ================= BACKGROUND ONLY ================= */}
      <div className={footerBackgroundStyles.backgroundContainer}>
        <div className={footerBackgroundStyles.floatingOrb1} />
        <div className={footerBackgroundStyles.floatingOrb2} />
        <div className={footerBackgroundStyles.floatingOrb3} />
        <div className={footerBackgroundStyles.floatingOrb4} />

        <div className={footerBackgroundStyles.gridOverlay}>
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(99,102,241,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(99,102,241,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>
      </div>

      {/* ================= CONTENT LAYER ================= */}
      <div className="relative z-10">
        <div className={footerStyles.container}>
          <div className={footerStyles.grid}>
            {/* Brand */}
            <div className={footerStyles.brandSection}>
              <div className={footerStyles.brandTransform}>
                <div className={footerStyles.brandContainer}>
                  <div className={footerStyles.brandGradient} />
                  <div className="relative font-serif flex items-center gap-3">
                    <img src={logo} alt="logo" className="w-12 h-12" />
                    <h3 className={footerStyles.brandTitle}>SkillForge</h3>
                  </div>
                </div>
                <p className={footerStyles.brandDescription}>
                  Transform your learning journey with interactive courses and
                  cutting-edge educational technology designed for modern
                  learners.
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4
                className={`${footerStyles.sectionHeader} ${iconColors.cyan}`}
              >
                <ArrowRight className={footerStyles.sectionIcon} />
                <span>Quick Links</span>
              </h4>

              <ul className={footerStyles.linksList}>
                {quickLinks.map((link, index) => {
                  const Icon = iconMap[link.iconKey] || ArrowRight;
                  return (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className={`${footerStyles.linkItem} ${iconColors.cyan}`}
                        style={{ transitionDelay: `${index * 80}ms` }}
                      >
                        <Icon className={footerStyles.linkIcon} />
                        <span className="truncate">{link.name}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4
                className={`${footerStyles.sectionHeader} ${iconColors.purple}`}
              >
                <HelpingHand className={footerStyles.sectionIcon} />
                <span>Support</span>
              </h4>

              <ul className={footerStyles.linksList}>
                {supportLinks.map((link, index) => {
                  const Icon = iconMap[link.iconKey] || HelpCircle;
                  return (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className={`${footerStyles.linkItem} ${iconColors.purple}`}
                        style={{ transitionDelay: `${index * 80}ms` }}
                      >
                        <Icon className={footerStyles.linkIcon} />
                        <span className="truncate">{link.name}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4
                className={`${footerStyles.sectionHeader} ${iconColors.emerald}`}
              >
                <Phone className={footerStyles.sectionIcon} />
                Contact Us
              </h4>

              <div className={footerStyles.contactSpace}>
                <div className={footerStyles.contactItem}>
                  <div
                    className={`${footerStyles.contactIconContainer} ${contactIconGradients.address}`}
                  >
                    <MapPin
                      className={`${footerStyles.contactIcon} ${iconColors.cyan600}`}
                    />
                  </div>
                  <div>
                    <p className={footerStyles.contactTextPrimary}>
                      {contactInfo.addressLine1}
                    </p>
                    <p className={footerStyles.contactTextSecondary}>
                      {contactInfo.city}
                    </p>
                  </div>
                </div>

                <div className={footerStyles.contactItem}>
                  <div
                    className={`${footerStyles.contactIconContainer} ${contactIconGradients.phone}`}
                  >
                    <Phone
                      className={`${footerStyles.contactIcon} ${iconColors.purple600}`}
                    />
                  </div>
                  <div>
                    <p className={footerStyles.contactTextPrimary}>
                      {contactInfo.phone}
                    </p>
                    <p className={footerStyles.contactTextSecondary}>
                      {contactInfo.phoneHours}
                    </p>
                  </div>
                </div>

                <div className={footerStyles.contactItem}>
                  <div
                    className={`${footerStyles.contactIconContainer} ${contactIconGradients.email}`}
                  >
                    <Mail
                      className={`${footerStyles.contactIcon} ${iconColors.emerald600}`}
                    />
                  </div>
                  <p className={footerStyles.contactTextPrimary}>
                    {contactInfo.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
