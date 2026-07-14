import { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Avatar from '../../components/common/Avatar';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';
import bgStadium from '../../assets/bgstadium2.png';

const ProfilePage = () => {
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    fullName: 'Rahul Organizer',
    email: 'rahul.organizer@cricauction.com',
    phone: '+91 98765 43210',
    company: 'CricAuction Events',
    password: '*************'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('Saving profile data:', formData);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
      
      {/* 1. Add the Sidebar and lock it to 'settings' */}
      <Sidebar activePage="settings" />

      {/* 2. Push the content right by 220px so it doesn't hide behind the sidebar */}
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'auto', position: 'relative' }}>
        {/* Fixed background image */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: '220px',
          right: 0,
          bottom: 0,
          backgroundImage: `url(${bgStadium})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
        }} />

        {/* If your team built TopBar.jsx, uncomment the line below to add the top navigation */}
        {/* <TopBar user={{ name: 'Rahul Organizer', role: 'Organizer' }} /> */}

        <main style={{ padding: '40px 32px', maxWidth: '1000px', overflow: 'visible', position: 'relative', zIndex: 1 }}>
          
          <div className="page-header">
            <h1>Profile Settings</h1>
            <p>Update your personal and organization details.</p>
          </div>

          {/* Theme Toggle Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.45)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            borderRadius: '8px',
            padding: '20px 32px',
            marginBottom: '24px',
          }}>
            <div className="theme-toggle-wrapper">
              <div className="theme-toggle-label">
                <span className="theme-toggle-label-text">Dark Mode</span>
                <span className="theme-toggle-label-desc">Switch between light and dark themes</span>
              </div>
              <label className="theme-toggle">
                <input
                  type="checkbox"
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                />
                <span className="theme-toggle-slider"></span>
                <span className="theme-toggle-icons">
                  <span></span>
                  <span></span>
                </span>
              </label>
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-grid">
              <div className="settings-left-col">
                <Avatar 
                  imageSrc={null} 
                  onPhotoChange={() => console.log('Open file picker')} 
                />
              </div>

              <div className="settings-right-col">
                <div className="form-row">
                  <InputField 
                    label="Full Name" 
                    value={formData.fullName} 
                    onChange={(e) => handleInputChange('fullName', e.target.value)} 
                  />
                  <InputField 
                    label="Email Address" 
                    value={formData.email} 
                    onChange={(e) => handleInputChange('email', e.target.value)} 
                  />
                </div>

                <div className="form-row">
                  <InputField 
                    label="Phone Number" 
                    value={formData.phone} 
                    onChange={(e) => handleInputChange('phone', e.target.value)} 
                  />
                  <InputField 
                    label="Role" 
                    value="Organizer" 
                    disabled={true} 
                  />
                </div>

                <InputField 
                  label="Organization / Company" 
                  value={formData.company} 
                  onChange={(e) => handleInputChange('company', e.target.value)} 
                />

                <div className="password-row">
                  <div className="password-input-wrapper">
                    <InputField 
                      label="Password" 
                      type="password"
                      value={formData.password} 
                      disabled={true}
                    />
                  </div>
                  <Button variant="outline" className="change-pwd-btn">Change Password</Button>
                </div>
              </div>
            </div>

            <div className="settings-footer">
              <Button variant="outline" className="cancel-btn">Cancel</Button>
              <Button variant="primary" onClick={handleSave}>Save Changes</Button>
            </div>
          </div>

          <div className="info-banner">
            <div className="info-icon">i</div>
            <div>
              <h4 className="info-title">Profile Information</h4>
              <p className="info-desc">This information will be used across the platform and visible to other organizers and users.</p>
            </div>
          </div>
          
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;