import React, { useState } from 'react';
import Pic1 from '../assets/pic1.png';
import Pic3 from '../assets/pic3.png';
import { useNavigate } from "react-router";
import { firestore } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import Modal from '@/components/ui/Modal';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorText, setErrorText] = useState('');
  const mailRef = React.createRef<HTMLInputElement>();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSubscribe = async () => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const email = mailRef.current?.value;

    if (!email || !emailRegex.test(email)) {
      setErrorText('Please enter a valid email address');
      setTimeout(() => setErrorText(''), 3000);
      return;
    }

    await addDoc(collection(firestore, 'subscribers'), { email });
    closeModal();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e0f7fa] p-8">
      
      {/* HERO Section */}
      <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
        
        {/* Left Image */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="relative group">
            <img
              src={Pic1}
              alt="Sports Activities"
              className="rounded-3xl shadow-2xl object-cover w-96 h-96 group-hover:scale-105 transition-transform duration-500 ease-in-out"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20 rounded-3xl"></div>
            <h2 className="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold">
              Discover Amazing Places
            </h2>
          </div>
        </div>

        {/* Right Text + Inputs */}
        <div className="w-full md:w-1/2 flex flex-col gap-6">
          <h1 className="text-5xl font-extrabold text-[#065C64] leading-tight">
            Find Your Perfect Field
          </h1>
          <p className="text-lg text-gray-700">
            Search and book fields easily. Whether you’re an athlete, a coach, or a fan, your next adventure starts here.
          </p>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Search Field */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search field name"
                className="w-full p-4 rounded-xl border-2 border-[#065C64] focus:ring-4 focus:ring-[#81e6d9] shadow-md transition-all"
              />
            </div>

            {/* Select City */}
            <div className="flex-1">
              <select
                className="w-full p-4 rounded-xl border-2 border-[#065C64] focus:ring-4 focus:ring-[#81e6d9] shadow-md transition-all"
                defaultValue=""
              >
                <option value="" disabled>Choose a city</option>
                <option value="new-york">New York</option>
                <option value="los-angeles">Los Angeles</option>
                <option value="chicago">Chicago</option>
                <option value="houston">Houston</option>
                <option value="miami">Miami</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => navigate('/signIn')}
            className="mt-6 bg-[#065C64] text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:bg-[#04787c] transition-all hover:scale-105"
          >
            Explore Now
          </button>
        </div>

      </div>

      {/* BOTTOM IMAGE Section */}
      <div className="relative w-full flex justify-center mb-16">
        <div className="relative group w-96">
          <img
            src={Pic3}
            alt="Basketball Adventure"
            className="rounded-3xl shadow-2xl object-cover w-full h-96 group-hover:scale-105 transition-transform duration-500 ease-in-out"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 rounded-3xl"></div>
          <h3 className="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold">
            Start Your Journey Now
          </h3>
        </div>
      </div>

      {/* FOOTER Section */}
      <div className="bg-[#065C64] text-white py-12 rounded-t-3xl shadow-inner">
        <div className="container mx-auto flex flex-col items-center gap-4">
          <h2 className="text-4xl font-bold">Your Adventure Starts Here</h2>
          <p className="text-lg text-center max-w-2xl">
            Ready to embark on an exciting journey? Find and book the perfect sports field near you now!
          </p>
          <button
            onClick={openModal}
            className="mt-4 px-6 py-3 bg-white text-[#065C64] font-bold rounded-full shadow-md hover:bg-gray-200 transition"
          >
            Join the Community
          </button>
        </div>
      </div>

      {/* Subscription Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2 className="text-2xl font-bold text-black mb-4">Ready to make every day a PlayDay?</h2>
        <p className="text-lg text-black mb-6">
          Subscribe to get updates on fields, features, and more!
        </p>

        <input
          ref={mailRef}
          type="email"
          className="w-full p-4 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-[#065C64] shadow-sm"
          placeholder="email@example.com"
        />
        <p className="text-red-500 mt-2">{errorText}</p>

        <button
          onClick={handleSubscribe}
          className="mt-6 bg-[#065C64] text-white px-6 py-3 rounded-xl shadow-md hover:bg-[#04787c] transition"
        >
          Subscribe
        </button>
      </Modal>

    </div>
  );
};

export default HomePage;
