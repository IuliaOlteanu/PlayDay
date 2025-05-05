import React, { useContext, useState, useEffect } from "react";
import FieldCard from "@/components/FieldCard";
import { FieldCardProps } from "@/components/FieldCard";
import { collection, doc, setDoc, getDoc, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from '../lib/firebase'; // Update with your Firebase config file path
import { v4 as uuidv4 } from "uuid"; // To generate unique IDs
import { AuthContext } from "@/components/context/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

function MyFields() {
  const [fields, setUserFields] = useState<FieldCardProps[]>([]);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [fieldData, setFieldData] = useState({
    fieldName: "",
    location: "",
    price: "",
    description: "",
  });
  const [username, setUsername] = useState("");
  const { toast } = useToast();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      // Fetch the username from the 'users' collection
      const fetchUsername = async () => {
        try {
          const userDocRef = doc(firestore, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
  
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUsername(userData.name || "User"); // Assuming 'name' is the field storing the username
          } else {
            console.error("User document does not exist");
          }
        } catch (error) {
          console.error("Error fetching username:", error);
        }
      };
  
      fetchUsername();
  
      // Real-time listener for fields
      const fieldsRef = collection(firestore, "fields");
      const q = query(fieldsRef, where("owner", "==", user.uid));
  
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userFields = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<FieldCardProps, "id">),
        }));
        setUserFields(userFields);
      });
  
      return () => unsubscribe(); // Cleanup listener on unmount
    }
  }, [user]);

  const handleAddField = () => setShowAddFieldModal(true);
  const handleCloseModal = () => {
    setShowAddFieldModal(false);
    setFieldData({ fieldName: "", location: "", price: "", description: "" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFieldData({ ...fieldData, [e.target.name]: e.target.value });
  };

  const handleSaveField = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fieldData.fieldName || !fieldData.location || !fieldData.price) {
      toast({
        title: "Please fill in all required fields.",
        description: "All fields are required to add a new field.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate a unique ID for the new field
      const uniqueID = uuidv4();

      // Add the new field to Firestore
      await setDoc(doc(collection(firestore, "fields"), uniqueID), {
        ...fieldData,
        id: uniqueID, // Store the unique ID with the field data
        owner: user?.uid, // Store the ID of the user who added the field
        createdAt: new Date(),
      });

      toast({
        title: "Field added successfully!",
        description: "Your new field has been added successfully.",
        variant: "default"
      });
      handleCloseModal();
    } catch (error) {
      console.error("Error adding field: ", error);
      toast({
        title: "Error adding field",
        description: "An error occurred while adding your new field. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const buttonClass =
    "px-8 py-3 bg-[#065C64] text-white text-lg font-medium rounded-full shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105";

  const sidebarButtonClass =
    "px-4 py-2 text-lg text-[#065C64] font-medium rounded-md transition-all duration-300 hover:border hover:border-[#065C64]";

  return (
    <div className="flex">
        <Toaster />
      {/* Sidebar */}
      <div className="w-1/5 p-8" style={{ backgroundColor: "#f8fafc", height: "100vh", overflowY: "auto" }}>
        <div className="flex flex-col items-center">
          <img
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAABaFBMVEX17uX////yzqUeHiPmpCLBytTZjCHUsIwhbdkknPKjcF+7hmAAAAD17ubMmHImJiblnwD48+3etY3tx5/yzaP8+vfz0Kr8+vj79Ov406kwkejEzNTmohrYiRbVs5AAAAfZupsUFRz3+f317N0AAA8ADxgTadnluILBjmgeICL04s7z2bvnwZucZ1jSq4Xs6ugNDRSyusR/oNYAY9Xqt17nqjHy4cXXhQDhmyLvw4flrWjipVjemUDxypnjsXTVpn89ODO1hm/jzLbp4tmOiIN+oMByuvZuamnEwsDb4ObS0M45O0ChttV6f4ZpZWTorEHrv3DptFTrvnbckzOginFORj5iV0rCpoaQfWd5alm1m35wYlJAOzXMooSygm3n1MGkoJtXU1GUjYegmZLJwbhLTFE+pvWvsLJ5vfYyMzePx/aKtt7a2NZsrualpqmrw9k4edhqlNd0dntFfthSVVuWnqeRq9dch9VZwjhDAAASLklEQVR4nN2d/UMTRxrHNwGM2mxhyZs0CTEGK0KEoEQPEdHCVaUtCNZeX6wFX+pxperV9vrv3+xudjPvO8/ME+vd95dWWGbns88z33lmspv1cv/v8t7HSWq1SqUS0KpUarXa+zj1qAlrhMv3PZV8n7COGnRkhIRNScYrCEaIORLCSqCOmzKeQWUUXRkBYc2CbqSUuIQ2weOEDolIWHGmGwkkFmHN3FcM5CNaDw6he3KKkFiBRCDEDR+lwL1vOQRCtNEnZURIVkfCkfLhMDoRjpwvYnQckA6E74UvYnSKozVh7X3xRYx/AeGo/BOf0Y6w8p75PIf50YbwvSboUJZhtCB83wk6lFUYwYR/UQBj2YQRSvgXjEBG8IkDSPhXBjAWOIwgQsMABtrtJ2cBwwghNLMYf2HvYXlxIdo09CMNfxX/g/mZhWCGAyA09FB/YaoxNdUY33u4kV+83knIEqxOJ/5RhG+JCMpUY8Ka6en9TmM8VKNBQInG+3v7q6H29/rxTwh/f/9gbXHBs105+yMgBHhoMM6qkYr94dTU3sNqxw7SNx+MhoSQSSLYb4ybiVCOP1y0syVjRDNCUBkTbEwZEkaUU/2qZ4No6jdGhLA6jVgNgDBk3Fu0yVVDvzEhhBaiwappmqaMqx2LatcM0YAQGEE/8DaAhIRxfHFUiNmEoPzxg87M6hQYkGhqzSJTTRAzCSGn9YOFtb4VX4h4YOGpBohZhICTkvgdNCzxYsSRRDGDEDA4Am/NNnwJ4tooxqKe0PyMflDtwyYJGeLGCBC1hABA78AxgDHidYt5MWPq1xECPohf2EPgI5PGnk15oy/gNITmtWhw3cVhaFkNRT2imtB4ueQFixgZOlDHpka1IwQA4vGNN9Zslhq69aKS0Pg0PlqKxqpet1gYawxVRWg8HPxOHxXw1I0bzZvwhbHaUBWEAJcxXu+aAYZq3nh0aQFoOUq3kRMCXAa03DUDjCBPXYItqJRDUU5oPggX8COYMsIWVKqhKCUE1DLQxa5OfzvF6sZt0PyvGIoyQvNB6C8i5igPSBDXIbOjIk9lhOaNBjjFmgKQZOotCKI8TyWEgByt4oVQBhgiQuZ/aZ6KhOY+ijlTyAFJol6C2I0Zofk186+jhVDBF0YRsqCS5alACFnVr+lCGO7i9/v98H8cAE811x39lCcE5KjvaXymMb5/sFGuEpXXVsczGDWAJE9Bq+JsQkAINUna6B9sVKv5gaob2vGqGoJJEG9CRqKYpxwh6BMYVZI2xg/yKV7MqNmEywAkQQT0SRJE7ieg3VF5PdNorHJ8URhVGU0Am0NJCauQXglBZAkh+ZB8Eiok6JrAF2lVGkYC9ejW+s3bl4hu31y/dUqEhKWpsMhgCSEtyYdhY78sB8xX14QwNhqPbl6K/GhwSDW/cemWwPjIqQJnCGEtlSWEjVUFX8zYp+NI0nlDzOd89dIjjrG5AFoOVzSEkHa84EDMusaBBjCM0dp++qF3/0AV7TwXxhuLsE+H1ISwVbWk6s4AjCDLawer+/urB7LwJSpzVlOC9ayiJAQ14wUioC5F6UhWq1V9rC8xQWyCalM+iBQhcGMk4IdhY88I0EiPHMyUs1OKENaK7wlGs4EGWL1NB7G5Dr34ckLgXYd+hyM0GITm2jjlQsgEcUgI3KAUCPt4fCSIt5wIAxkh9MZRnrChKGUsCW82aULwHriMEHqZhBhiAubztJs2b7ns8qeE0DY4p2k8xCUsN12ylA6iZxlCfraYwjPSSNVHboQ1gdDiLgiaEHMujAnXh0EEz4cenaYDQsDmRdpGf4RJylhN8zac0OcJbe6BoLcmGshJms9Tcz60aotU4Qhtbg2k1xb9Mjbh2pAQtshPuscS2jxFEVD35zX2kZOUMVPg6mkgltDmBgh/Zmp0w5CIylLYCnigCkNo0wK9i9FYQweklxcdi+6laepZOikRXdSgGw1Z6KeAt+yeJaMJrVrwPeoWBXSjyefXXabDUBWK0O6pB2q/tI8/DIdTfnPajjCgCK0aoPa8R2Cl1JRvZ6Vekqae5Vzh0Z+PGm7Q2BJaWamX1Kae7TCknzqQL+/LJoNzZoYcVw7/oyRs2j60WkkJbR+w6iSVqbD67U5vfhxrc7qrpsuTw+bnP/roo/l5cmCepUzKNpuVRawgJbRsYFiZstNhKaFLtCmH7H78EauPmeNSQpuqNJKfEFo/+JpWpjShwBcxloT4CXwRY0kktKpKYyWE1s9mp1ZDrSymJXyhpjnCTQlfqOFxyT6GtdEMrMZzeLbXv97gCVPAzc3pUJtpRDdpvvJ8QjS/uTQ9vbS5mf5gczAa033vR1Y1W6TAmdBLnKbMAjIDr5tAlgXAj4fuQlxnkLZLbAxtKxqK0K4ojVt4GN/+nBCWYhTeWAZDcxjF+cGgY81zphv/vEsTNpvAj2Vo+TGhyxP2/mJ0m0VCKKYjHdv5wRib2eRG3FBRGOcpwhvr9qPQi63Gc/sSiCC6QzgZh2FCygBjxASpFAMKc/wguslxISFJUeenvh0J41Xi0GnK08K8MEAcThibtKFwKi2lqUtmi+Ytq6dLcQmjm4Sl+1AzoRRxSjJRd1xI6JSiXmw1nusXQYTLRCnh14/vfPMPSddL7CCc+Z4c973kuNtNm11EGaFjI14wMyXbxHh88fLk5blvxa5Ph4TDXP4mOu478bjbzRtWT5fQCs3Uc5gsBq10+lMC4cx37clQF8UoMoQzX1+MjxOiWL15w2EmTIRCSFbCEsIYcPKyGByWcHJw3DcSQtuVL0fo/oUzxE4Fwu5FVc85wrnBcY/5w6o3Tzn3LKpMEQg9vy/GMCH8wTqG684+40XThYfQTHAgrPFnfhgzG4ffDsbr1yKh/aoJndCvirsY3Tuk65cviiHkvLT0OES8KCZz1a1ewyX0OpJ9mtJ3k5NPhMgIhPn8t3cm78iOu43QsXBCRCEMDsQOklqlJK1VeELVcTZPPYs9I4QYX+jkQzb1eUKFyghzBSLhImBX35QQYxhGhBjyF0ZAaL95QenDJvyQYuiNghBl/KDFsINPmEfp2QdMWM6jfGsfWpZ65oCmhBg1G95s4XlV8yAaZinKdPghE+JM+JiExoD/o4SQosaQEKWkQau8QYSl8BObzKM+OMLr2LeblBcw+oW2PoSVbWaEKGXph02IkqUVnJ0oD1aYmhGidAtrr40IUra9b0L3HWEPWJgaAVYxuhXvCKNUpn4HFxCrLMUjBJVtRsIpaXyMT9cGQibEK9rcPyGN5S+iAn6QhMgxxCnaKs73YqTCLtuQijbn+2mGwi5qkEqawT1RGE2hT/konfJd7/pihEuItkvjdm8iLV8+XZTO6nXlrhQQyUorrveX0lKYafdKBuJZOSGOlSZ3X6JYjWJ1MXNXj3ilICfEWR063wXNyJcPxPJTLeCP0rumkOru4X3eI53zu3BAzIoGkVA5X2gQC3JArCQdPm+BMxCVe6Yl+Vi88rSkAESaK6hnZkb9IeJM4anAeOWpKoCYO4luz66J0qygCnfPUpBXzt6dVR5KQojTHfrZNZy9Gv1WRqnw492nZ69cIXQ/zirzEzGEzPOHSOv8jCXUTCrdUVhGmj6vbv8csEwIK32sPSj2KVmsN+JhbLkhzRTD741ILBVJOgMxAzyP9U66HEuI1Gxn1hVxGouQ+8YBrDTtzBbcEGcLWIQ1jhApTQlhoWBwJ4lCZfLnSITCN39g1aYhYUH91KhepfCPkQgrAiFObRoTWiJ2C4iEOYEQx2sGhFaDcfCnOISy74lCSdOEEB7GUvKHOIQ1CSFOEFNCIGK3gEpIf3PikBAliAVK5p5aov4KhbAiJUTxmgUa0TSMwwAWls5vIfSC+fJL++++lCpXOb8EDGNplgL8DKX2qCgIMYJIRvhPsDDSAZzdQrrOCkKMxkMPC+gwzurDyAawgtOJQEmIEMTYpX+iM1UXRiqAhaUtrMucUxIitD6Yh/xZE0aG73wF6zIHGkL3py3TmfYzGrHQFXO13J2lAX/CSyQW0OE72fWEuS0mjIXZbreUYJZKXQaPBHB43Z0J+RdA8EmLRpirsWFMSCU/GwYQgVB4nw5H6BhE9nXZWxIaCd8s0ylXQuHdXXzWutVM/gX2ep2XhZED/Izt07IbYOb7LdxKinMcITdvyPgKW9xfLJ9zIhRfvya88cI6iOfOnds55Akzwrh0XujRg8Mt0pJtJySv0hEIrcYB6dLW4fZksbgsnkEXxgXx8FfF4vH2C1tKsT3J25DAZnPu3NaL7aO5Vm9srHhfdopZOSM9Rwy1TZrptdpHz154cEjZKwJlL9cB0Z07OdydbPXaY6F625JTKOYNZo4Y6mXcUntu7nj3FTCU0teSSQhN8zQ8+YvtydZc3KeoX7vSXpN5g2eUBzCXu3A8NmxtrjW5DQmltEXZT03ylKTmzrOjVpiajBSvkqxwYSQLQblOWmx7vVZv9/mOGaX89YBS7gw/jVLz3nGRCl4imdXEWqAQl2aVL3i9XxTaJKF8cs/AexSveJSeSpen5Dwvtu/0JHQR4StV16l5g5/kaX3FJ0UMSbznybMXWkjVazrlF1Mx75MT7Dw/Kia+IpHcagb6qRB9h9ssP8nT+l3ZdLtXbO0ebikTVnXVFOkiDkVy/bYO792RpSbdjZea3uce/D2UUBVQuqBrPEzY4hPFZKl8I7BqQPgcHknNozFN8BIVdd3/+UyozzWHnIjDUAhla+zouZCw6lceqwhrFB0J3lF7LpsuInyQBahFfNXKPkU0WY7dY6s7dZPKX1USOuIrGalJq6W0mhRQhyg3GjklnbCat6ur4QOPpOazo7Yw5WnV+yobUIP40vhSjkXeczmaLDXvrNYR5l7sHrfMg5ecVWE1DKAaMXMYCucLqzudOesIa1+AojfQsdQqOUAVYrbRSFS8pwPUEeaWJ6ERJGqdmACeOfNP2RnNjIZV70gLqCW0uqTSqkYElCOaG02q9h1loWhAmNuBI8qsRgYoRTzObp8HnMwAzCDM7YDTpv27IeCZTwTEC+BR0R7LAswilNX6WeLP+bkckCD+y/V6ZkcwmxCOyFc1D35REZ55wx0KNZp2T2ZrUEIwIlfV1CfqKsQ39QkW8TeY0RikqBFh7j7svKzVPJiYmKj/KgX8pU5+xyCCKhqjFDUjJI4KqqXoqiYEVCBGgAziMuxKHhsBGhHmTtoQRGoBFQMSRNFOf60PfjdEBM1Nc4/NAM0Ic8svAZlaTId/AjhRn+ARU0AK8TXAaFr6Ug1MmKvtmp+99ZoHJIhvWMSfJygliACjKep2S6wIyemNUyixmgc0Rf0NC1iXIJobTfHQGNCcMPfK2G+ORUCC+MsnQ72ps7+MEJdNr2Gvt2MOCCDMnRwbZlH7ggg4Ub967dNUX3KEEaKp0bSODD0GTJhbPjLrQ2tHBJyovz2d6tN/84QTpNOv54xaBwxBMGEud2iUqaSqEQHffDokPP2W/3WIaGQ0benHW3iEuZNJgwvd+00AJElKE4ppOjGRsVUaqwjLUAvCXO03gzB+IYao/o4hFNN0YiV7CLQhHmpLSMpUgzCuiEl6mpEkTf/InHGLLw2WEgiEBmFsvdYn6enT14Q0rWftYFgF0I6Q+PoT/fXufSUk4TuWUEzTuvozmZhvFzwCHQhztcMx3RVv/871n3XSSAKhdo+mdQdqoY6EZG7c1qUqbzV8kkrcdEWXE8Xntnz2hGTiOFIz9jirqb8TCPk0/UOZFL3iPcsEdSQkrqpkbP3BJek1Pkl5N1UaTa+1a+OgOIRqRs5qxCQV0lRhNCR+bnyuhMRWj4qSi89ZTf2thJBL0y9Gw+dOSMbjPcltC5N09yVOKqTpitBEu9Xedhl/eITEV58d88lazEpSPk35iqZXfPla/ck1RBiEZH68v8t+TsxYjeikQpqyRtMuFn+DLHK1wiEkWj6kPwzvfZWVpKfZSX9oNO1W8fErzafWUKEREp08f9lqtQWrkScpV5sOKppeq3f0GmP0DYVJSHRyuNsrhndtHFO9lyYpm6bh0qk9V5y89woXL4dOSLR8/9mTYnEurWqUSUqn6R/FYvHo8AQxOVPhE4aq3X+eLqBUScq46bPXaM7CazSEoWonyzsr9ZWV+ulwk02gI7r2Z31lor6ys4yembRGRxhrefnCl/+5evXPd28J1bVYBPftuz+vXv3PmwujhYs0asJEtdoFWrVRjDi5/gtceOjIKaw9xQAAAABJRU5ErkJggg=="
            alt="Logo"
            className="w-200 h-200 rounded-full object-cover shadow-lg mb-4"
          />
          <h3 style={{
            margin: "10px 0",
            fontSize: "20px",
            fontWeight: "bold",
            paddingTop: "20px"
           }}>{username || "My Account"}</h3>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4">
          <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "10px 0" }} />
          <button className={sidebarButtonClass}>Profile Data</button>
          <button className={sidebarButtonClass}>Bookings</button>
          <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "10px 0" }} />
        </div>

      </div>

      {/* Main Content */}
      <div className="flex-1 p-8" style={{ overflowY: "auto" }}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4" >
          <input
            type="text"
            placeholder="Search"
            style={{
              padding: "10px",
              width: "19%",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          />
          <div className="flex gap-4">
            <button className={buttonClass}>Filter1</button>
            <button className={buttonClass}>Filter2</button>
            <button className={buttonClass}>Filter3</button>
          </div>
          <button onClick={handleAddField} className={buttonClass}>
            Add Field
          </button>
        </div>

        {/* Field Cards */}
        <div className="flex flex-col gap-4 overflow-y"
        >
        <div className="grid grid-cols-4 gap-5 w-full"
        >
            {fields.map((field) => (
            <FieldCard
                key={field.id}
                id={field.id}
                fieldName={field.fieldName}
                location={field.location}
                price={field.price}
                owner={field.owner}
                description={field.description}
                // onDelete={() => handleDeleteField(field.id)}
            />
            ))}
        </div>

        </div>
      </div>

      {/* Add Field Modal */}
      {showAddFieldModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div
            className="bg-white rounded-lg p-6 w-1/2 max-w-[1000px] text-center"
          >
            <div
              className="flex justify-between items-center"
            >
              <h3 className="font-bold text-lg" >Add New Field</h3>
              <button
                onClick={handleCloseModal}
                className="font-bold bg-white-600 text-black px-4 py-2 rounded hover:bg-red-500 hover:text-white"
              >
                X
              </button>
            </div>
            <form onSubmit={handleSaveField} className="mt-4 text-left font-bold">
              {/* Field Name */}
              <div className="mb-4">
                <label>Field Name:</label>
                <input
                  type="text"
                  name="fieldName"
                  value={fieldData.fieldName}
                  onChange={handleInputChange}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px",
                    marginTop: "5px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                  }}
                />
              </div>

              {/* Location */}
              <div className="mb-4">
                <label>Location:</label>
                <input
                  type="text"
                  name="location"
                  value={fieldData.location}
                  onChange={handleInputChange}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px",
                    marginTop: "5px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                  }}
                />
              </div>

              {/* Price */}
              <div className="mb-4">
                <label>Price:</label>
                <input
                  type="number"
                  name="price"
                  value={fieldData.price}
                  onChange={handleInputChange}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px",
                    marginTop: "5px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                  }}
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={fieldData.description}
                  onChange={handleInputChange}
                  rows={5}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px",
                    marginTop: "5px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                  }}
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyFields;
