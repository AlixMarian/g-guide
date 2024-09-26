import { useEffect, useState, useRef } from 'react';
import { getAuth, onAuthStateChanged, updatePassword} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from '/backend/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../websiteUser.css';


export const PaymentHistory = () => {


    return(
        <h1>Payment History Page</h1>
    );
};

export default PaymentHistory;