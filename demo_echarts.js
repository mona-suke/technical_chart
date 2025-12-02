function technical_chart(data,ma5,ma20,pmi_datas) {
	console.log(data);
    var myChart = echarts.init(document.getElementById('technicalchart'));
    const dates = data.map(d => d.date);
    const values = data.map(d => [d.open, d.close, d.low, d.high]);
	const start = dates[0];
	const end = dates[dates.length];

    let pmi_array = [];
    pmi_datas.forEach(d => {
        let trg_x = dates.indexOf(d.date);
        if (trg_x != -1) {
            let trg_y = values[trg_x][2] * 1.05;
            pmi_array.push({
                name: 'pmi',
                value: d.value,
                coord: [trg_x, trg_y]
            });
        }
    });

	console.log(pmi_array);
        // markpointの結果を受け取ってからチャート描画
        var option = {

		title: {
			text: "LMEセレクト銅　テクニカルチャート（日足）",
			left: "center",
			top: "top",
			textStyle: {
			fontSize: 25,
			color:"#333333"
			}
		},
		textStyle:{
			size:14
		},
            tooltip: {
                trigger: 'axis'
            },
		legend:{
			data:['pmi','MA5','MA20'],
			left: "60%",
			bottom:"30%"
		},
            toolbox: {
                show: true,
			itemSize: 25,
                feature: {
                    mark: { show: true },
                    dataZoom: { show: true },
                    dataView: { show: true, readOnly: false },
                    restore: { show: true },
                    saveAsImage: { show: true }
                },
			iconStyle:{
			borderColor:'#BF092F'
			}
            },
            dataZoom: {
                show: true,
                realtime: true,
                start: 0,
                end: 50
            },
            xAxis: {
                type: 'category',
			axisLabel: {
				color: "#132440"
			},
			boundaryGap : true,
			axisTick: {onGap:false},
			splitLine: {show:false},
			scale: true,
                data: dates
            },
            yAxis: {
			type: 'value',
			name: "ドル／トン",
			axisLabel: {
				color: "#132440"
			},
                scale: true,
                boundaryGap: [0.01, 0.01]
            },
            series: [
                {
                    type: 'candlestick',
			itemStyle: {
			color: '#BF092F',           // 陽線
			color0: 'transparent',   // 陰線
			borderColor:'#BF092F',
			borderColor0:'#132440',
			borderWidth:1
		},
		name:'lme copper',
                  data: values,
                  markPoint: {
                  symbol: 'image://https://sangyopress.sakura.ne.jp/datasearch/images/emarker.png',
                  symbolSize: 25,
                  itemStyle: {
					  normal: { label: { position: 'top' } }
				  },
					  data: pmi_array 
                    }
                },
			{
				name: 'MA5',
				type: 'line',
				data: ma5,
				showSymbol: false,
				smooth: true,
				itemStyle: {
					color: '#0a915d'
			},
			lineStyle: {
				opacity: 0.5,
				color: '#0a915d',
				width:2
			}
			},
			{
			name: 'MA20',
			type: 'line',
				data: ma20,
					showSymbol: false,
					smooth: true,
					itemStyle: {
						color: '#ff6347'
					},
					lineStyle: {
						opacity: 0.5,
						color: '#ff6347',
						width:2
					}
				},
            ]
        };

        myChart.setOption(option);
}

// markpoint関数のコールバック対応
function markpoint(start, end, dates, values, callback) {
    $.ajax({
        url: 'https://sangyopress.sakura.ne.jp/datasearch/get_data_pmi.php',
        type: 'POST',
        dataType: 'json',
        data: {
            table: 'pmi',
            start_date: start,
            end_date: end
        }
    }).done(function (response) {
        const pmi_datas = response.data;
        let pmi_array = [];
        pmi_datas.forEach(d => {
            let trg_x = dates.indexOf(d.date);
            if (trg_x != -1) {
                let trg_y = values[trg_x][2] * 1.05;
                pmi_array.push({
                    name: 'pmi',
                    value: d.value,
                    coord: [trg_x, trg_y]
                });
            }
        });
        callback(pmi_array); // コールバックで返す
    });
}

function osci_chart(data,ma5,ma20) {
    const dates = data.map(d => d.date);
    const values = data.map(d => d.close);
    var myChart = echarts.init(document.getElementById('osci'));
	const ema12 = calculateEMA(values,12);
	const ema26 = calculateEMA(values,26);
	const macd = calculateMACD(ema12,ema26,26);
	const signal = calculateSMA(macd,9);
	const drvalues = calculatedailyreturn(values);
	const [hv,annuv]=calcHistoricalVolatility(values);

    var option = {
		grid: [{ 
			top:'10%',
			bottom: '50%' // 1つ目のgridを定義
			}, {
			top: '60%' // 2つ目のgridを定義
		}],
		title: [{
			text: "トレンド（MACD）",
			left: "center",
			top: '5%',
			textStyle: {
				fontSize: 25,
				color:"#333333"
			}
		},
				{
			text: "ボラティリティ",
			left: "center",
			top: '55%',
			textStyle: {
				fontSize: 25,
				color:"#333333"
			}
				}],
		textStyle:{
			size:14
		},
		tooltip: {
			trigger: 'axis'
		},
			legend:[{
				data:['close','MACD','Signal'],
				top:"8%",
				left: "60%",
				bottom:"85%"
			},
					{
				data:['HV','annualV'],
				top: "58%",
				left: "60%"
					}],
            toolbox: {
                show: true,
				itemSize: 25,
                feature: {
                    mark: { show: true },
                    dataZoom: { show: true },
                    dataView: { show: true, readOnly: false },
                    restore: { show: true },
                    saveAsImage: { show: true }
                },
				iconStyle:{
					borderColor:'#BF092F'
				}
            },
            dataZoom: [
				{
                show: true,
                realtime: true,
                start: 0,
                end: 50,
				xAxisIndex: [0, 1]
            },
				{
                show: true,
                realtime: true,
                start: 0,
                end: 50,
				gridIndex:1
            }
			],
            xAxis: [
				{
                type: 'category',
				axisLabel: {
						color: "#132440"
					},
				boundaryGap : true,
				axisTick: {onGap:false},
				splitLine: {show:false},
				scale: true,
                data: dates
            },
				{
                type: 'category',
				axisLabel: {
						color: "#132440"
					},
				boundaryGap : true,
				axisTick: {onGap:false},
				splitLine: {show:false},
				scale: true,
                data: dates,
				gridIndex:1
            }
			],
            yAxis: [
				{
					type: 'value',
					name: "ドル／トン",
					axisLabel: {
							color: "#132440"
						},
					scale: true,
					boundaryGap: [0.01, 0.01],
					position:'left'
				},
				{
					type: 'value',
					axisLabel: {
							color: "#132440"
						},
					scale: true,
					boundaryGap: [0.01, 0.01],
					position:'right'
				},
				{
					type: 'value',
					axisLabel: {
							color: "#132440"
						},
					scale: true,
					boundaryGap: [0.01, 0.01],
					position:'left',
					gridIndex:1
				},
				{
					type: 'value',
					axisLabel: {
							color: "#132440"
						},
					scale: true,
					boundaryGap: [0.01, 0.01],
					position:'right',
					gridIndex:1
				}
				
			],
            series: [
				{
					name: 'close',
					type: 'line',
					data: values,
					showSymbol: false,
					smooth: true,
					yAxisIndex: 0, // 左軸を使用,
					itemStyle: {
						color: '#ffd10a'
					},
					lineStyle: {
						opacity: 0.5,
						color: '#ffd10a',
						width:2
					}
				},

				{
					name: 'MACD',
					type: 'line',
					data: macd,
					showSymbol: false,
					smooth: true,
					yAxisIndex: 1, // 左軸を使用,
					itemStyle: {
						color: '#a092f1'
					},
					lineStyle: {
						opacity: 0.5,
						color: '#a092f1',
						width:2
					}
				},
				{
					name: 'Signal',
					type: 'line',
					data: signal,
					showSymbol: false,
					smooth: true,
					yAxisIndex: 1, // 左軸を使用,
					itemStyle: {
						color: '#ff6347'
					},
					lineStyle: {
						opacity: 0.5,
						color: '#ff6347',
						width:2
					}
				},
				{
					name: 'HV',
					type: 'line',
					data: hv,
					showSymbol: false,
					smooth: true,
					xAxisIndex: 1,
					yAxisIndex: 2, // 左軸を使用,
					itemStyle: {
						color: '#b6d634'
					},
					lineStyle: {
						opacity: 0.5,
						color: '#b6d634',
						width:2
					}
				},
				{
					name: 'annualV',
					type: 'line',
					data: annuv,
					showSymbol: false,
					smooth: true,
					xAxisIndex: 1,
					yAxisIndex: 3, // 左軸を使用,
					itemStyle: {
						color: '#5070dd'
					},
					lineStyle: {
						opacity: 0.5,
						color: '#5070dd',
						width:2
					}
				}
            ]
        };

        myChart.setOption(option);
}

function calculateEMA(data, period) {
	const alpha = 2 / (period + 1);
	let emaValues = [];
	let currentEMA = 0;

  // 最初のEMAは単純移動平均で計算
	let sum = 0;
	for (let i = 0; i < period; i++) {
		sum += data[i];
		emaValues.push("");

	}
	currentEMA = sum / period;
	emaValues.push(currentEMA);

  // 2日目以降のEMAを計算
	for (let i = period; i < data.length; i++) {
		currentEMA = currentEMA + alpha * (data[i] - currentEMA);
		emaValues.push(currentEMA);
	}
	return emaValues;
}

function calculateMACD(short,long,maxperiod){
	let macdvalues=[];
	let macd=0;
	for(let i =0 ; i<maxperiod; i++){
		macdvalues.push("");
	}
	for (let i =maxperiod; i< long.length; i++){
		macd= long[i]-short[i];
		macdvalues.push(macd);
	}
	return macdvalues;
}

function calculateSMA(data, period) {
    const smaValues = [];
    
    // 最初の期間（例:5日間）は平均が計算できないため、結果配列の先頭を埋める
    for (let i = 0; i < period - 1; i++) {
        smaValues.push(""); 
    }

    // 移動平均の計算
    for (let i = period - 1; i < data.length; i++) {
        // 現在のインデックスから過去 period 分のスライスを取得
        const slice = data.slice(i - period + 1, i + 1);

        // 合計を計算
        const sum = slice.reduce((acc, current) => acc + current, 0);
        
        // 平均を計算して結果に追加
        const average = sum / period;
        smaValues.push(average);
    }
    return smaValues;
}

function calculatedailyreturn(data){
	const drvalues = [];
	
	for (let i = 0; i < data.length; i++){
		if (i==0){
			drvalues.push("");
		}else{
			drvalues.push(Math.log(data[i]/data[i-1]));
		}
	}
	// console.log(drvalues);
	return drvalues;
}
/**
* ヒストリカルボラティリティ（HV）を計算する
* prices:リターン）
* period: 何日分のデータで計算するか（例: 20）
*/
function calcHistoricalVolatility(data, period = 20) {
	//日次りたん
	const drvalues = [];
	const annualVol = [];	
	const dailyVol =[];
	
	for (let i = 0; i < data.length; i++){
		if (i==0){
			drvalues.push("");
		}else{
			drvalues.push(Math.log(data[i]/data[i-1]));
		}
	}

    for (let i = 1; i < drvalues.length; i++) {
        // 現在のインデックスから過去 period 分のスライスを取得
        const slice = drvalues.slice(i - period + 1, i + 1);

	
	   // 2. 標準偏差を計算
	   const mean = slice.reduce((a, b) => a + b, 0) / i;
	   const variance = slice
		   .map(r => (r - mean) ** 2)
		   .reduce((a, b) => a + b, 0) /period;

		dailyVol.push(Math.sqrt(variance));
	   // 3. 年間換算（252営業日）

		annualVol.push(Math.sqrt(variance) * Math.sqrt(252));
	
    }	
   return [
       dailyVol,   // 日次ボラティリティ
       annualVol   // 年間換算ボラティリティ
   ];
}// JavaScript Document
