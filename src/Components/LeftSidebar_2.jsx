// src/Components/Sidebar.js
import React, { useState } from 'react';
import { Box, Drawer, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, IconButton } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ReactApexChart from 'react-apexcharts'

const LeftSidebar_2 = (props) => {

    const [open, setOpen] = useState(false);
    const earthquakeData = props.earthquakeData;
    const handleToggleDrawer = () => {
        setOpen((open) => !open);
        sendData(open)
    };

    const magStat = (earthquakeData) => {
        function createData(name, magnitude, percentage) {
            return { name, magnitude, percentage };
        }
        var rows = []
        var length = parseInt(earthquakeData.length)
        var greaterThan1 = 0, greaterThan3 = 0, greaterThan45 = 0, greaterThan6 = 0, greaterThan7 = 0, greaterThan8 = 0
        var percentage_1 = 0, percentage_3 = 0, percentage_45 = 0, percentage_6 = 0, percentage_7 = 0, percentage_8 = 0
        earthquakeData.forEach(function (item) {
            if (item.magnitude >= 1 && item.magnitude < 3) {
                greaterThan1++
                percentage_1 = (greaterThan1 / length * 100).toFixed(2)
            } else if (item.magnitude >= 3 && item.magnitude < 4.5) {
                greaterThan3++
                percentage_3 = (greaterThan3 / length * 100).toFixed(2)
            } else if (item.magnitude >= 4.5 && item.magnitude < 6) {
                greaterThan45++
                percentage_45 = (greaterThan45 / length * 100).toFixed(2)
            } else if (item.magnitude >= 6 && item.magnitude < 7) {
                greaterThan6++
                percentage_6 = (greaterThan6 / length * 100).toFixed(2)
            } else if (item.magnitude >= 7 && item.magnitude < 8) {
                greaterThan7++
                percentage_7 = (greaterThan7 / length * 100).toFixed(2)
            } else if (item.magnitude >= 8) {
                greaterThan8++
                percentage_8 = (greaterThan8 / length * 100).toFixed(2)
            }
        })
        return {
            rows: [
                createData('弱震', greaterThan1, `${percentage_1}%`),
                createData('有感地震', greaterThan3, `${percentage_3}%`),
                createData('中强震', greaterThan45, `${percentage_45}%`),
                createData('强震', greaterThan6, `${percentage_6}%`),
                createData('大地震', greaterThan7, `${percentage_7}%`),
                createData('巨大地震', greaterThan8, `${percentage_8}%`),
            ], barconfig: {
                options: {
                    chart: {
                        id: 'apexchart-example',
                    },
                    xaxis: {
                        categories: ['弱震', '有感地震', '中强震', '强震', '大地震', '巨大地震']
                    },
                    plotOptions: {
                        bar: {
                            borderRadius: 6,
                            horizontal: false,
                        }
                    },
                },
                series: [{
                    name: "Magnitude",
                    data: [greaterThan1, greaterThan3, greaterThan45, greaterThan6, greaterThan7, greaterThan8],
                }],
            }
        }
    }

    const getMaxandMin = (earthquakeData) => {
        var max = 0, min = 10
        earthquakeData.forEach(function (item) {
            if (item.magnitude > max) {
                max = item.magnitude
            }
            if (item.magnitude < min) {
                min = item.magnitude
            }
        })
        return { max, min }
    }
    const sendData = (value) => {
        props.getValuefrombar(value)
    }

    return (
        <>
            <Drawer variant="persistent" anchor="right" open={props.open} sx={{ transition: 'width 0.3s' }}>
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6">
                        数据统计
                        {props.open && (
                            <IconButton onClick={handleToggleDrawer} sx={{ position: 'absolute', top: '16px', left: '380px' }}>
                                <ChevronRightIcon />
                            </IconButton>
                        )}
                    </Typography>
                </Box>
                <Box >
                    <ReactApexChart options={magStat(earthquakeData).barconfig.options} series={magStat(earthquakeData).barconfig.series} type="bar" height={350} />
                </Box>
                <Typography variant="body2" sx={{ mx: 2 }}>
                    震级最大值：{getMaxandMin(earthquakeData).max}&nbsp;震级最小值：{getMaxandMin(earthquakeData).min}
                </Typography>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 250 }} size="small" aria-label="a dense table">
                        <TableHead>
                            <TableRow>
                                <TableCell>地震震级分级</TableCell>
                                <TableCell align="right">震级计数</TableCell>
                                <TableCell align="right">震级占比</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {magStat(earthquakeData).rows.map((row) => (
                                <TableRow
                                    key={row.name}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">{row.name}</TableCell>
                                    <TableCell align="right">{row.magnitude}</TableCell>
                                    <TableCell align="right">{row.percentage}</TableCell>
                                </TableRow>
                            ))}
                            <TableRow>
                                <Typography variant="caption" sx={{ mx: 2 }}>
                                    注：对震级的简要分级依据来自：<a href='https://www.gov.cn/rdzt/content_2384087.htm' target="_blank">链接</a>
                                </Typography>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

            </Drawer>

        </>
    );
};

export default LeftSidebar_2;
