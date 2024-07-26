import { db } from '/backend/firebase';
import { doc, getDoc } from 'firebase/firestore';


export const getUserDetails = async (userId) => {
    
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            return userDoc.data();
        } else {
            console.log('No such document!');
            return null;
        }
    } catch (error) {
        console.error("Error fetching user details: ", error);
        return null;
    }
};

