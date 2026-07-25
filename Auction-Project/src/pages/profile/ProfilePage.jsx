import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, updateProfilePhoto } from '../../services/authService';
import Sidebar from '../../components/layout/Sidebar';
import Avatar from '../../components/common/Avatar';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import bgStadium from '../../assets/bgstadium2.png';

const ProfilePage = () => {
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '*************'
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || '',
        email: user.email || '',
        phone: user.mobile || '',
        password: '*************'
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      const res = await updateProfile({
        name: formData.fullName,
        email: formData.email,
        mobile: formData.phone,
      });
      setUser(res.data.user);
      setMessage('Profile updated successfully');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (file) => {
    try {
      setMessage('');
      const fd = new FormData();
      fd.append('photo', file);
      const res = await updateProfilePhoto(fd);
      setUser(res.data.user);
      setMessage('Photo updated successfully');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to upload photo');
    }
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

        <main style={{ padding: '40px 32px', maxWidth: '1000px', margin: '0 auto', overflow: 'visible', position: 'relative', zIndex: 1 }}>
          
          <div className="page-header">
            <h1>Profile Settings</h1>
            <p>Update your personal and organization details.</p>
          </div>

          <div className="settings-card">
            <div className="settings-grid">
              <div className="settings-left-col">
                <Avatar 
                  imageSrc={user?.photo || null} 
                  onPhotoChange={handlePhotoChange} 
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
                    value={user?.role || 'Organizer'}
                    disabled={true}
                  />
                </div>

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

                {message && (
                  <p style={{ marginTop: 12, fontSize: 14, color: message.includes('successfully') ? '#16a34a' : '#dc2626' }}>
                    {message}
                  </p>
                )}
              </div>
            </div>

            <div className="settings-footer">
              <Button variant="outline" className="cancel-btn">Cancel</Button>
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
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