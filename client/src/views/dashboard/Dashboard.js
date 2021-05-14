import React, { lazy, useState, useEffect } from 'react';
import axios from 'axios';
import {
  CBadge,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CCallout
} from '@coreui/react';
import CIcon from '@coreui/icons-react';

// import MainChartExample from '../charts/MainChartExample.js'

const WidgetsDropdown = lazy(() => import('../widgets/WidgetsDropdown.js'))
const WidgetsBrand = lazy(() => import('../widgets/WidgetsBrand.js'))

const Dashboard = () => {
  const [userCounts, setUserCounts] = useState({
    "userCount": {
        "Student": 0,
        "Teacher": 0,
        "Admin": 0
    }
});

  useEffect(() => {
    const getUsersData = async () => {
      const userData = await axios("http://localhost:5000/dash/userData");

      setUserCounts(userData.data);
    };
    getUsersData();
  }, []);

  // console.log(userCounts);
  return (
    <>
      <WidgetsDropdown userCounts={userCounts}/>
    </>
  )
}

export default Dashboard
