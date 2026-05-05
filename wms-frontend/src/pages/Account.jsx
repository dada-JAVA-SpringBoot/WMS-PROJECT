import React, { useState } from 'react';

const Account = () => {
  const [userInfo, setUserInfo] = useState({
    name: 'Gene Rodriguez',
    birthday: '1990-02-14',
    email: 'gene.rodrig@gmail.com',
    phone: '+84 123 456 789',
    address: 'Hồ Chí Minh, Việt Nam',
    github: 'https://github.com/genebio',
    linkedin: 'https://linkedin.com/in/gene-rodriguez',
    facebook: 'https://facebook.com/genebio',
    twitter: 'https://twitter.com/genebio',
    avatar: 'https://via.placeholder.com/150',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  // Function to handle file upload and update avatar
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create an object URL for the uploaded image file
      setUserInfo((prevInfo) => ({
        ...prevInfo,
        avatar: URL.createObjectURL(file), // Update avatar with the chosen file
      }));
    }
  };

  // Trigger file input click when the "Chỉnh sửa avatar" button is clicked
  const handleEditAvatar = () => {
    document.getElementById('avatar-input').click(); // Trigger file input click
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-center">
        <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md">
          {/* Profile Information */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <img
                src={userInfo.avatar}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-gray-300"
              />
              {/* Hidden file input, triggered by the "Chỉnh sửa avatar" button */}
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute bottom-0 right-0 text-white bg-blue-500 p-2 rounded-full opacity-0"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-semibold text-gray-800">{userInfo.name}</h2>
              <p className="text-gray-600">{userInfo.birthday}</p>
              <button
                onClick={handleEditAvatar} // Open file picker when clicked
                className="text-sm text-blue-500 hover:underline mt-2"
              >
                Chỉnh sửa avatar
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Contact Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={userInfo.email}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 bg-gray-100 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={userInfo.phone}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 bg-gray-100 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                value={userInfo.address}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 bg-gray-100 border rounded-md"
              />
            </div>

            {/* Social Links */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-800">Social Links</h3>
              <div className="flex space-x-4 mt-2">
                <a
                  href={userInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                >
                  <i className="fab fa-github text-2xl"></i>
                  <span className="text-sm">GitHub</span>
                </a>
                <a
                  href={userInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                >
                  <i className="fab fa-linkedin text-2xl"></i>
                  <span className="text-sm">LinkedIn</span>
                </a>
                <a
                  href={userInfo.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                >
                  <i className="fab fa-twitter text-2xl"></i>
                  <span className="text-sm">Twitter</span>
                </a>
                <a
                  href={userInfo.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                >
                  <i className="fab fa-facebook text-2xl"></i>
                  <span className="text-sm">Facebook</span>
                </a>
              </div>
            </div>

            {/* Save Changes Button */}
            <div className="mt-6 text-center">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;