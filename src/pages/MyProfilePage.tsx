import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore, storage } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { AuthContext } from '../components/context/auth-provider';
import { FaUser, FaEnvelope, FaCalendarAlt, FaGamepad } from 'react-icons/fa';

const MyProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'games' | 'rented'>('profile');
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchUser = async () => await getDoc(doc(firestore, 'users', user.uid));
    fetchUser()
      .then((userDoc) => {
        if (userDoc.exists()) {
          setUserData(userDoc.data());
          setNewName(userDoc.data()?.name || '');
        } else {
          setError('User not found');
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch user data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (newName !== userData?.name) {
      const userRef = doc(firestore, 'users', user!.uid);
      await updateDoc(userRef, { name: newName });
      setUserData((prevData: any) => ({ ...prevData, name: newName }));
    }

    if (imageFile) {
      setUploading(true);

      const storageRef = ref(storage, `${user!.uid}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      uploadTask.on(
        'state_changed',
        null,
        (error) => {
          console.error(error);
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const userRef = doc(firestore, 'users', user!.uid);
          await updateDoc(userRef, { profilePicture: downloadURL });
          setUserData((prevData: any) => ({ ...prevData, profilePicture: downloadURL }));
          setUploading(false);
        }
      );
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    navigate('/signIn');
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-gray-300 rounded-full mb-2">
            <img
              src={userData?.profilePicture || 'default-avatar.jpg'}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h2 className="text-lg font-semibold">{userData?.name}</h2>
        </div>
        <nav className="flex flex-col gap-4 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`text-left px-4 py-2 rounded-lg hover:bg-[#065C64] ${activeTab === 'profile' ? 'bg-gray-200' : ''}`}
          >
            Profile Data
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`text-left px-4 py-2 rounded-lg hover:bg-[#065C64] ${activeTab === 'games' ? 'bg-gray-200' : ''}`}
          >
            My Games
          </button>
          <button
            onClick={() => setActiveTab('rented')}
            className={`text-left px-4 py-2 rounded-lg hover:bg-[#065C64] ${activeTab === 'rented' ? 'bg-gray-200' : ''}`}
          >
            Rented Fields
          </button>
        </nav>
        <button
          onClick={handleSignOut}
          className="mt-auto bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeTab === 'profile' && (
          <div>
            <h1 className="text-2xl font-bold text-[#065C64] mb-6">Profile Information</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FaUser className="inline mr-2" />
                <strong>Name:</strong>
                <input
                  type="text"
                  value={newName}
                  onChange={handleNameChange}
                  className="border p-2 rounded mt-1 w-full"
                />
              </div>
              <div>
                <FaEnvelope className="inline mr-2" />
                <strong>Email:</strong> {userData?.email}
              </div>
              <div>
                <FaGamepad className="inline mr-2" />
                <strong>Role:</strong> {userData?.role}
              </div>
              <div>
                <FaCalendarAlt className="inline mr-2" />
                <strong>Joined:</strong> {userData?.createdAt?.toDate().toLocaleDateString()}
              </div>
              <div>
                <strong>Profile Picture:</strong>
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="border p-2 rounded mt-1 w-full"
                />
              </div>
            </div>
            <button
              onClick={handleSave}
              className={`mt-4 px-4 py-2 rounded-lg bg-[#065C64] text-white ${uploading ? 'opacity-50' : ''}`}
              disabled={uploading}
            >
              {uploading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {activeTab === 'games' && (
          <div>
            <h1 className="text-2xl font-bold text-[#065C64] mb-6">My Games</h1>
            {/* aici urmează partea cu lista de jocuri */}
            <p>Games list will be here...</p>
          </div>
        )}

        {activeTab === 'rented' && (
          <div>
            <h1 className="text-2xl font-bold text-[#065C64] mb-6">Rented Fields</h1>
            {/* aici urmează partea cu terenurile închiriate */}
            <p>Rented fields will be here...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfilePage;
