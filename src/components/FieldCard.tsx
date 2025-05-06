import React, { useState } from "react";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { firestore } from '../lib/firebase';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

interface FieldCardProps {
  id: string;
  fieldName: string;
  location: string;
  price: string;
  owner: string;
  description?: string; // Keep the description for adding or editing
  image?: string; // Optional image URL for the field
  onFieldUpdated?: () => void; // Callback to refresh fields after update
}

const FieldCard: React.FC<FieldCardProps> = ({
  id,
  fieldName,
  location,
  price,
  description,
  image,
  onFieldUpdated,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fieldName,
    location,
    price,
    description,
  });

  const { toast } = useToast();

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const fieldRef = doc(firestore, "fields", id);
      await updateDoc(fieldRef, editData);
      toast({
        title: "Field updated successfully!",
        description: "Your field has been updated successfully.",
        variant: "default" 
      });
      setIsEditing(false);
      if (onFieldUpdated) onFieldUpdated(); // Refresh the fields
    } catch (error) {
        console.error("Error updating field:", error);
        toast({
            title: "Failed to update field",
            description: "An error occurred while updating the field.",
            variant: "destructive" 
        });
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this field?")) {
      try {
        const fieldRef = doc(firestore, "fields", id);
        await deleteDoc(fieldRef);
        toast({
          title: "Field deleted successfully!",
          description: "Your field has been deleted successfully.",
          variant: "default" 
        });
        if (onFieldUpdated) onFieldUpdated(); // Refresh the fields
      } catch (error) {
        console.error("Error deleting field:", error);
        toast({
            title: "Failed to delete field",
            description: "An error occurred while deleting the field.",
            variant: "destructive" 
        });
      }
    }
  };

  return (
    <div
      className={`border border-gray-300 rounded-lg shadow-md bg-white flex flex-col justify-between overflow-hidden`}
    >
    <Toaster />
      {/* Image */}
      <div className={`w-full h-[150px] bg-gray-200 flex items-center justify-center`}>
        <img src={image || "data:image/jpeg;base64,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"} alt={fieldName} className={`w-full h-full object-cover`} />
      </div>

      {/* Field Details */}
      <div className={`p-4`}>
        {isEditing ? (
          <>
            <input
              type="text"
              name="fieldName"
              value={editData.fieldName}
              onChange={handleEditChange}
              placeholder="Field Name"
              className={`w-full mb-2 px-3 py-2 border border-gray-300 rounded-md`}
            />
            <input
              type="text"
              name="location"
              value={editData.location}
              onChange={handleEditChange}
              placeholder="Location"
              className={`w-full mb-2 px-3 py-2 border border-gray-300 rounded-md`}
            />
            <input
              type="text"
              name="price"
              value={editData.price}
              onChange={handleEditChange}
              placeholder="Price"
              className={`w-full mb-2 px-3 py-2 border border-gray-300 rounded-md`}
            />
            <textarea
              name="description"
              value={editData.description}
              onChange={handleEditChange}
              placeholder="Description"
              className={`w-full mb-2 px-3 py-2 border border-gray-300 rounded-md`}
              rows={3}
            />
          </>
        ) : (
          <>
            <p className={`text-lg font-semibold mb-1`}>
              <strong>Name:</strong> {fieldName}
            </p>
            <p className={`text-sm mb-1`}>
              <strong>Location:</strong> {location}
            </p>
            <p className={`text-sm mb-1`}>
              <strong>Price:</strong> ${price}/hour
            </p>
          </>
        )}
      </div>

      {/* Buttons */}
      <div className={`flex justify-between items-center p-4 border-t border-gray-300`}>
        {isEditing ? (
          <button
            onClick={handleUpdate}
            className={`px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600`}
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600`}
          >
            Edit
          </button>
        )}
        <button
          onClick={handleDelete}
          className={`px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600`}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default FieldCard;
export type { FieldCardProps };
