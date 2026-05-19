import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import getCroppedImg from '../../../utils/cropImage';

const Settings = () => {
  const { studentInfo } = useOutletContext();
  
  // Profile State
  const [profileData, setProfileData] = useState({
  name: '',
  hallTicket: '',
  year: '',
  semester: '',
  email: '',
  profilePic: ''
});
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  // Initialize state when studentInfo is available
  useEffect(() => {
    if (studentInfo) {
      setProfileData({
        name: studentInfo.name || '',
        hallTicket: studentInfo.hallTicket || '',
        year: studentInfo.year || '',
        semester: studentInfo.semester || '',
        email: studentInfo.email || '',
        profilePic: studentInfo.profilePic || ''
      });
    }
  }, [studentInfo]);

  const handleProfilePicChange = (e) => {

    const file = e.target.files[0];

    if (file) {

      const imageUrl = URL.createObjectURL(file);

      setSelectedImage(imageUrl);

      setShowCropModal(true);
    }
  };
  const onCropComplete = (_, croppedPixels) => {
  setCroppedAreaPixels(croppedPixels);
};
const handleSaveCroppedImage = async () => {

  try {

    const croppedBlob = await getCroppedImg(
      selectedImage,
      croppedAreaPixels
    );

    const fileName = `profile-${Date.now()}.jpg`;

    const { error } = await supabase.storage
      .from('student-profile-images')
      .upload(fileName, croppedBlob, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('student-profile-images')
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    const { data: { user } } = await supabase.auth.getUser();

    await supabase
      .from('students')
      .update({
        profile_pic: imageUrl
      })
      .eq('id', user.id);

    setProfileData({
      ...profileData,
      profilePic: imageUrl
    });

    setShowCropModal(false);

    window.location.reload();

  } catch (err) {

    console.error(err);

    alert('Failed to upload image');

  }
};

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage({ type: '', text: '' });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user found.");

      const { error } = await supabase
        .from('students')
        .update({
          full_name: profileData.name,
          hall_ticket: profileData.hallTicket,
          year: profileData.year,
          semester:
            profileData.year === "1"
              ? null
              : profileData.semester,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update Auth Metadata as well
      await supabase.auth.updateUser({
        data: {
          full_name: profileData.name,
          hall_ticket: profileData.hallTicket,
          year: profileData.year,
          semester:
            profileData.year === "1"
              ? null
              : profileData.semester,
        }
      });

      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setProfileMessage({ type: 'error', text: error.message || 'Failed to update profile.' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingPassword(true);
    setPasswordMessage({ type: '', text: '' });

    // Supabase updateUser only requires new password if user is logged in
    // Note: To strictly enforce current password check, you would need to either:
    // 1. Write an RPC / Edge function to verify it, OR
    // 2. Re-authenticate the user first. 
    // Here we'll just use the standard updateUser to change password.
    
    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      setIsUpdatingPassword(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '' }); // clear fields
    } catch (error) {
      setPasswordMessage({ type: 'error', text: error.message || 'Failed to update password.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  

return (
  <div>

    <AnimatePresence>

      {showCropModal && (

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
        >

          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="bg-white rounded-2xl p-6 w-[90%] max-w-lg shadow-2xl"
          >

            <h2 className="text-xl font-bold mb-4">
              Crop Profile Picture
            </h2>

            <div className="relative h-72 bg-slate-100 rounded-xl overflow-hidden">

              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                objectFit="horizontal-cover"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />

            </div>

            <div className="mt-6">

              <input
                type="range"
                min={1}
                max={2}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />

            </div>

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => setShowCropModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 hover:bg-slate-300"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveCroppedImage}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
              >
                Save
              </button>

            </div>

          </motion.div>

        </motion.div>

      )}

    </AnimatePresence>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Student Profile</h2>
        <p className="text-slate-500">Manage account details used for department-wise material access.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-200 flex items-center gap-4">

              <div className="relative">
              

                <motion.img
                  key={profileData.profilePic}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  src={
                    profileData.profilePic ||
                    `https://ui-avatars.com/api/?name=${profileData.name}`
                  }
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover object-top border-4 border-white shadow-md"
                />

                <label className="absolute bottom-0 right-0 bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition">

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePicChange}
                  />

                  ✎

                </label>

              </div>

              <div>
                <h3 className="font-bold text-slate-800 text-xl">
                  Academic Details
                </h3>

                <p className="text-sm text-slate-500">
                  {studentInfo?.email}
                </p>
              </div>

            </div>
            
            <div className="p-6 space-y-6">
              {profileMessage.text && (
                <div className={`p-3 rounded-lg text-sm border ${profileMessage.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                  {profileMessage.text}
                </div>
              )}
              
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={profileData.email} 
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-100 text-slate-500  cursor-not-allowed" 
                    readOnly 
                    disabled
                  />
                  <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Student name</label>
                    <input 
                      type="text" 
                      value={profileData.name} 
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hall ticket number</label>
                    <input 
                      type="text" 
                      value={profileData.hallTicket} 
                      onChange={(e) => setProfileData({...profileData, hallTicket: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                      placeholder="e.g. 1604-XX-XXX-XXX" 
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* YEAR */}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Year
                    </label>

                    <select
                      value={profileData.year}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          year: e.target.value,
                          semester: e.target.value === "1" ? "" : profileData.semester
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      required
                    >
                      <option value="" disabled>Select</option>

                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>

                    </select>
                  </div>

                  {/* SEMESTER */}

                  {profileData.year !== "1" && (

                    <div>

                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Semester
                      </label>

                      <select
                        value={profileData.semester}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            semester: e.target.value
                          })
                        }
                        className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        required
                      >

                        <option value="" disabled>
                          Select Semester
                        </option>

                        <option value="1">
                          Semester 1
                        </option>

                        <option value="2">
                          Semester 2
                        </option>

                      </select>

                    </div>

                  )}

                </div>
                
                <button 
                  type="submit"
                  disabled={isUpdatingProfile}
                  className={`text-white font-medium py-2 px-6 rounded-lg transition-colors ${
                    isUpdatingProfile ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isUpdatingProfile ? 'Saving...' : 'Save profile'}
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h3 className="font-bold text-slate-800 mb-1">Change Password</h3>
            <p className="text-sm text-slate-500 mb-6">Update your account password securely.</p>
            
            {passwordMessage.text && (
              <div className={`mb-4 p-3 rounded-lg text-sm border text-left ${passwordMessage.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                {passwordMessage.text}
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New password</label>
                <input 
                  type="password" 
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  placeholder="••••••••" 
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                  required
                  minLength={6}
                />
                <p className="text-xs text-slate-400 mt-1">Must be at least 6 characters.</p>
              </div>
              <button 
                type="submit"
                disabled={isUpdatingPassword}
                className={`w-full font-medium py-2.5 rounded-lg transition-colors ${
                  isUpdatingPassword 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isUpdatingPassword ? 'Updating...' : 'Update password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
