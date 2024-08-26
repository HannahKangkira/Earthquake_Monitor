// src/App.js
import React, { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, Typography, ButtonGroup, Button, Paper, List, ListItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { EllipsoidGeodesic, Cartographic, Cartesian3 } from 'cesium';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CesiumViewer from './Components/CesiumViewer';
import PubSub, { publish } from 'pubsub-js'
import Swal from 'sweetalert2';
import Sidebar from './Components/Sidebar';
import LeftSidebar_1 from './Components/LeftSidebar_1';
import LeftSidebar_2 from './Components/LeftSidebar_2';
import LeftSidebar_3 from './Components/LeftSidebar_3';


function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: '#1976d2',
      },
    },
  });

  const [isSidebar_1Open, setIsSidebar_1Open] = useState(false);
  const [isSidebar_2Open, setIsSidebar_2Open] = useState(false);
  const [isSidebar_3Open, setIsSidebar_3Open] = useState(false);
  const [earthquakeData, setData] = useState([])
  const [globalLight, setLight] = useState(false)
  const [showFps, setFps] = useState(false)
  const [totalData, setTotalData] = useState();
  const [userLat, setLat] = useState(36)
  const [magVal, setMag] = useState(3.5)
  const [autoRefresh, setRefreshFlag] = useState(false)
  const [refreshVal, setRefresh] = useState(1)
  const [userLong, setLong] = useState(103)
  const [userAlt, setAlt] = useState(1520)
  const [antiAliasing, setAliasing] = useState(1.5)
  const viewerRef = React.createRef()
  const [currentApi, setApi] = useState(1)
  const [showShelterOpen, setShowShelterOpen] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [shelters, setshelters] = useState([{ class: 'Unknown', id: 0, lat: 0, lon: 0, name: 'Unknown' }])
  const [urgentReport, setUrgent] = useState({
    latitude: 0,
    longitude: 0,
    place: 'Unknown',
    time: 0,
    magnitude: 0.0
  })
  const [latestquakeData, setltsqd] = useState({
    latitude: 0,
    longitude: 0,
    place: 'Unknown',
    time: 0,
    magnitude: 0.0
  })

  var latestSubscribe = function (msg, data) {
    switch (msg) {
      case 'LATEST DATA':
        setltsqd(data)
        break;
      case 'URGENT REPORT':
        setUrgent(data)
        setltsqd(data)
        console.log(data)
        break;
      case 'OPEN ALERT':
        setOpen(true)
        break;
      case 'SET LAT':
        setLat(data)
        break;
      case 'SET LONG':
        setLong(data)
        break;
      default:
        console.log('Pubsub 通信错误')
        break;
    }
  };
  PubSub.subscribe('LATEST DATA', latestSubscribe)
  PubSub.subscribe('OPEN ALERT', latestSubscribe)
  PubSub.subscribe('URGENT REPORT', latestSubscribe)
  PubSub.subscribe('SET LAT', latestSubscribe)
  PubSub.subscribe('SET LONG', latestSubscribe)

  const handleClose = () => {
    setOpen(false);
  };

  const handleShowShelterClose = () => {
    setShowShelterOpen(false);
  };

  const handleManageShowSidebar_1 = () => {
    if (isSidebar_1Open == true) {
      setIsSidebar_1Open(false)
    } else {
      setIsSidebar_1Open(true)
    }
  };

  const getValuefrombar1 = (value) => {
    setIsSidebar_1Open(value)
  }
  //获取得到的地震表单数据
  const getDatafrombar1 = (value) => {
    setData(value)
  }
  const getTotalDatafrombar1 = (value) => {
    setTotalData(value)
  }
  //获取最新发生的地震数据
  const getLatestfrombar = (value) => {
    setltsqd(value)
  }

  const handleManageShowSidebar_2 = () => {
    if (isSidebar_2Open == true) {
      setIsSidebar_2Open(false)
    } else {
      setIsSidebar_2Open(true)
    }
  };


  const getValuefrombar2 = (value) => {
    setIsSidebar_2Open(value)
  }

  const handleManageShowSidebar_3 = () => {
    if (isSidebar_3Open == true) {
      setIsSidebar_3Open(false)
    } else {
      setIsSidebar_3Open(true)
    }
  };
  //获取选中的api信息
  const getCurrentapifrombar3 = (value) => {
    setApi(value)
  }

  const getValuefrombar3 = (value) => {
    setIsSidebar_3Open(value)
  }
  const getLightStatusfrombar3 = (value) => {
    setLight(value)
  }
  const getShowFpsfrombar3 = (value) => {
    setFps(value)
  }
  const getAntiAliasingbar3 = (value) => {
    setAliasing(value)
  }
  const getMagValfrombar3 = (value) => {
    setMag(value)
  }
  const getRefreshFlagfrombar3 = (value) => {
    setRefreshFlag(value)
  }
  const getRefreshValfrombar3 = (value) => {
    setRefresh(value)
  }

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    Swal.fire("请点击确认/allow 许可网页获取您的位置信息")
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      Swal.fire({
        text: "无法获取当前地理位置！"
      })
    }
    function showPosition(position) {
      setLat(position.coords.latitude)
      setLong(position.coords.longitude)
      if (position.coords.altitude == 0 || position.coords.altitude == "") {
        var alt = prompt("请输入所在的海拔高度 为空将默认为1520米")
        if (alt == 0 || alt == "") {
          setAlt(1520)
        } else {
          setAlt(alt)
        }
      }
    }
  }
  const getDistance = (start, end) => {
    var geodesic = new EllipsoidGeodesic();
    geodesic.setEndPoints(start, end)
    return (geodesic.surfaceDistance / 1000).toFixed(2)
  }

  const getDatafromdb = async () => {

    const formData = new URLSearchParams();
    formData.append('lat', userLat);
    formData.append('long', userLong);

    const res = await fetch('http://10.2.148.244:8080/api/shelter', {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString()
    })
    const { data } = await res.json();
    setshelters(data)

  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" >
          <Toolbar>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }} textAlign={'left'}>
              Earthquake Mornitor
            </Typography>
            <Button
              variant='contained'
              sx={{ position: 'absolute', marginLeft: '260px', marginTop: '110px', padding: 0.2 }}
              onClick={() => {
                publish('SET SHOW PIN', false)
                publish('FLY DEST', Cartesian3.fromDegrees(103, 36, 5020000))
              }}
            >返回原视图</Button>
            <Button variant="contained" color="error" sx={{ height: '40px', padding: 2 }} onClick={() => {
              getDatafromdb()
              setShowShelterOpen(true)
            }}>
              <WarningAmberIcon />&nbsp;
              <Typography sx={{ marginTop: '5px', color: 'white' }} >
                查询避难场所
              </Typography>
            </Button>&nbsp;&nbsp;
            <div style={{ position: 'absolute', marginTop: '110px' }}><Time></Time></div>
            {/* Add a series of buttons here with text */}
            <Paper variant="outlined" sx={{ height: '32px', padding: 0.5, backgroundColor: 'orange' }} onClick={() => { PubSub.publish('FLY DEST', Cartesian3.fromDegrees(latestquakeData.longitude, latestquakeData.latitude, 3000)) }}>
              <Typography sx={{ marginTop: '5px', color: 'white' }}>
                最近地震：{latestquakeData.place} M{latestquakeData.magnitude}
              </Typography>
            </Paper>&nbsp;&nbsp;
            <ButtonGroup variant="contained" aria-label="outlined primary button group">
              <Button onClick={handleManageShowSidebar_1}>地震列表</Button>
              <Button onClick={handleManageShowSidebar_2}>数据统计</Button>
              <Button onClick={handleManageShowSidebar_3}>控制面板</Button>
            </ButtonGroup>
          </Toolbar>
        </AppBar>
        <Sidebar
          currentApi={currentApi}
          userLat={userLat}
          userLong={userLong}
          magVal={magVal}
          earthquakeData={earthquakeData}
        ></Sidebar>
        <LeftSidebar_1
          open={isSidebar_1Open}
          getTotalDatafrombar={getTotalDatafrombar1}
          getValuefrombar={getValuefrombar1}
          userLat={userLat}
          userLong={userLong}
          totalData={totalData}
          earthquakeData={earthquakeData}
          latestquakeData={latestquakeData}
          getDatafrombar={getDatafrombar1}
          getLatestfrombar={getLatestfrombar}
          refreshVal={refreshVal}
          currentApi={currentApi}
          autoRefresh={autoRefresh}
        ></LeftSidebar_1>
        <LeftSidebar_2
          open={isSidebar_2Open}
          getValuefrombar={getValuefrombar2}
          earthquakeData={earthquakeData}
        ></LeftSidebar_2>
        <LeftSidebar_3
          open={isSidebar_3Open}
          getValuefrombar={getValuefrombar3}
          latitude={userLat}
          longitude={userLong}
          getShowFpsfrombar={getShowFpsfrombar3}
          showFps={showFps}
          getCurrentLocation={getCurrentLocation}
          currentApi={currentApi}
          globalLight={globalLight}
          autoRefresh={autoRefresh}
          refreshVal={refreshVal}
          latestquakeData={latestquakeData}
          getMagValfrombar={getMagValfrombar3}
          getAntiAliasingbar={getAntiAliasingbar3}
          getRefreshFlagfrombar={getRefreshFlagfrombar3}
          getRefreshValfrombar={getRefreshValfrombar3}
          getLightStatusfrombar={getLightStatusfrombar3}
          getCurrentapifrombar={getCurrentapifrombar3}
        ></LeftSidebar_3>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          sx={{
            position: 'absolute',
            backgroundColor: 'whitesmoke',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            margin: 'auto',
            zIndex: 990
          }}
        >
          <DialogTitle id="alert-dialog-title">
            {'地震发生！'}
          </DialogTitle>
          <DialogContent sx={{ width: '320px', height: '80px' }}>
            <DialogContentText id="alert-dialog-description">
              <Typography variant="body2" sx={{ font: "Fira Sans" }}>
                {urgentReport.place} M{urgentReport.magnitude}
              </Typography>
              <Typography variant="body2" sx={{ font: "Fira Sans" }}>
                坐标：{urgentReport.longitude} {urgentReport.latitude}
              </Typography>
              <Typography variant="body2" sx={{ font: "Fira Sans" }}>
                发震时间{new Date(urgentReport.time).toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ font: "Fira Sans" }}>
                距您{getDistance(Cartographic.fromDegrees(urgentReport.longitude, urgentReport.latitude), Cartographic.fromDegrees(userLong, userLat))}km
              </Typography>
            </DialogContentText>
            <Paper
              sx={{
                position: 'absolute',
                width: '60px',
                height: '70px',
                marginTop: '-78px',
                marginLeft: '260px',
                backgroundColor: urgentReport.magnitude < 4 ? '#00BBFF' : urgentReport.magnitude < 6 ? 'orange' : urgentReport.magnitude < 7 ? 'red' : 'magenta',
                borderRadius: '5px',
              }}
            >
              <Typography variant="h2" align='center' sx={{ color: 'white', marginTop: '1px' }}>
                {parseInt(urgentReport.magnitude)}
              </Typography>
            </Paper>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} autoFocus>
              确定
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
      <CesiumViewer
        currentApi={currentApi}
        latitude={userLat}
        longitude={userLong}
        altitude={userAlt}
        magVal={magVal}
        earthquakeData={earthquakeData}
        globalLight={globalLight}
        showFps={showFps}
        onRef={viewerRef}
        antiAliasing={antiAliasing}
      ></CesiumViewer>
      <Dialog
        open={showShelterOpen}
        onClose={handleShowShelterClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          周围的避险地点
        </DialogTitle>
        <DialogContent>
          <List>
            {shelters.map((shelter, index) => (
              <ListItem key={index}>
                <Paper elevation={3} sx={{ padding: 1, width: '350px' }}>
                  <Typography >
                    <Typography variant='body2'>{shelter.name}</Typography>
                    <Typography variant='body2' sx={{ marginLeft: '215px', marginTop: '-20px' }}>{shelter.class}</Typography>
                    <Typography variant='body2'>距您{shelter.dist}km</Typography>
                    <Button
                      variant='outlined'
                      sx={{ position: 'absolute', marginLeft: '275px', marginTop: '-40px', padding: 0.8 }}
                      onClick={() => {
                        publish('SHOW NEW SHELTER', shelter)
                        handleShowShelterClose()
                        publish('FLY DEST', Cartesian3.fromDegrees(shelter.lon, shelter.lat, 3000))
                      }}
                    >查看地点</Button>
                  </Typography>
                </Paper>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleShowShelterClose} autoFocus>
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

class Time extends React.Component {
  state = { date: new Date() }
  componentDidMount() {
    setInterval(() => {
      this.setState({ date: new Date() })
    }, 1000);
  }
  render() {
    return (
      <div>
        <Typography variant="subtitle2" noWrap component="div" sx={{ flexGrow: 1 }} textAlign={'right'}>
          {this.state.date.toTimeString()}
        </Typography>
      </div>
    )
  }
}
export default App;
