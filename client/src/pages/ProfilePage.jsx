import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";

const ProfilePage = () => {
  const { authUser, updateProfile, deleteUser } = useContext(AuthContext);
  console.log(authUser);
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [name, setName] = useState(authUser.fullName);
  const [bio, setBio] = useState(authUser.bio);
    const [showConfirm, setShowConfirm] = useState(false); 

  const saveUpdate = async() =>{
    if (!selectedImage) {
      await updateProfile({ fullName: name, bio });
      navigate("/");
      return;
    }
  
    //convert image to base64Url
    const reader = new FileReader();
    reader.readAsDataURL(selectedImage);
    reader.onload = async () => {
      const base64Image = reader.result;
      await updateProfile({ profilePic: base64Image, fullName: name, bio });
      navigate("/");
    };
  }

  const deleteAccount = async() =>{
    //functionality to delete account
    await deleteUser(authUser._id);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = e.nativeEvent.submitter.value;
    if(action === "save"){
      await saveUpdate();
    }
    else{
      setShowConfirm(true);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center bg-no-repeat">
      <div
        className="backdrop-blur-2xl text-gray-300 flex items-center justify-between 
      max-sm:flex-col-reverse w-5/6 max-w-2xl border-2 border-gray-600 rounded-lg"
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 gap-5 p-10"
        >
          <h3 className="text-lg text-">Profile Details</h3>
          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              onChange={(e) => setSelectedImage(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={
                selectedImage
                  ? URL.createObjectURL(selectedImage)
                  : assets.avatar_icon
              }
              alt=""
              className={`w-12 h-12 ${selectedImage && "rounded-full"}`}
            />
            upload profile image
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            required
            placeholder="Your Name"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <textarea
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write profile bio"
            required
            rows={4}
            value={bio}
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <div className="flex w-full gap-4 max-md:flex-col">
            <button
              type="submit"
              name="action" value="save"
              className="bg-gradient-to-r from-purple-400 to-violet-600
              hover:from-purple-500 hover:to-violet-700  text-white 
            rounded-full p-2 text-lg cursor-pointer flex-1 transition-all duration-300"
            >
              Save
            </button>
              <button
              type="submit"
              name="action" value="delete"
              className="bg-gradient-to-r from-red-400 to-red-700
              hover:from-red-500 hover:to-red-800  text-white 
            rounded-full p-2 text-lg cursor-pointer flex-1"
            >
              Delete Account
            </button>
          </div>
        </form>
        <img
          src={authUser?.profilePic || assets.logo_icon}
          alt="Logo Image"
          className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10
          ${selectedImage && "rounded-full"}`}
        />
      </div>

      {/* ----------Confirmation Popup---------- */}
      {showConfirm && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-gray-900 text-gray-200 p-6 rounded-xl shadow-lg w-[min(90%,400px)] text-center">
            <p className="mb-6 text-sm">
              The account will be <span className="text-red-400 font-medium">deactivated</span> and permanently deleted after 7 days.
              <br />
              You can restore it by logging in again before then.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={deleteAccount}
                className="flex-1 bg-red-600 hover:bg-red-700 transition text-white rounded-full py-2"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 transition text-white rounded-full py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
