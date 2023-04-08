function parseRoute(jsonText)
{
    let obj = JSON.parse(jsonText);
    return new Route(
        obj.name,
        obj.curves,
        obj.gradients,
        obj.limitSpeeds,
        obj.tunnels,
        obj.stations
    );
}

function parseVehicle(jsonText)
{
    let obj = JSON.parse(jsonText);

    if (!Array.isArray(obj.tractiveForces)) {
        obj.tractiveForces = defaultTractiveForce(
            obj.acceleration,
            obj.fixedTorqueSpeed,
            obj.constantPowerSpeed,
            obj.maxSpeed,
            obj.mCars,
            obj.tCars,
            obj.mWeight,
            obj.tWeight,
            obj.coefficient0,
            obj.coefficient1
        )
    }
    if (obj.runningResistance == null)
    {
        obj.runningResistance = defaultRunningResistance(
            obj.mCars,
            obj.tCars,
            obj.mWeight,
            obj.tWeight,
            obj.maxSpeed
        )
    }

    return new Vehicle(
        obj.name,
        obj.tractiveForces,
        obj.runningResistance,
        obj.deceleration,
        obj.mCars,
        obj.tCars,
        obj.mWeight,
        obj.tWeight,
        obj.maxSpeed
    )
}

function reload()
{
    document.getElementById("error").innerHTML = "処理中…";

    let _route;
    let _vehicle;
    try {
        _route = parseRoute(document.getElementById('input-route').value);
        _vehicle = parseVehicle(document.getElementById('input-vehicle').value);
        route = _route;
        vehicle = _vehicle;
    }
    catch(ex) {
        document.getElementById("error").innerHTML = '<span style="color: red;">入力JSONのパースに失敗しました。</span>';
    }

    let resultSpeed = [];
    let resultLimitSpeed = [];
    let resultTimeArray = [];
    let resultTime = [];
    for (let i = 0; i < _route.stations.length-1; i++)
    {
        let arr = runcurve.getSpeed(_route, _vehicle, i);
        resultSpeed.push(...arr);
        resultLimitSpeed.push(...runcurve.getLimitSpeed(route, _vehicle, i));
        resultTimeArray.push(...runcurve.getTimeArray(arr));
        resultTime.push(runcurve.getTime(arr));
    }

    { // times:tableの描画
        let str = '<tr><th>駅名</th><th>距離程</th><th>最高速度</th><th>計算時秒</th></tr>';
        for (let i = 0; i < _route.stations.length-1; i++)
        {
            str += `<tr><td>${_route.stations[i].name}</td><td>${_route.stations[i].position}</td><td>${_route.stations[i].maxSpeed}</td><td>${resultTime[i].toFixed(2)}</td></tr>`;
        }
        str += `<tr><td>${_route.stations[_route.stations.length-1].name}</td><td>${_route.stations[_route.stations.length-1].position}</td><td>-</td><td>-</td></tr>`;
        document.getElementById("times").innerHTML = str;
    }
    
    const type = "line";
    let data = {
        labels: [...Array(resultSpeed.length)].map((_, i) => i),
        datasets: [{
            label: "速度",
            fill: true,
            borderColor: "rgba(0,0,127,0.8)",
            pointRadius: 0,
            data: resultSpeed
        },{
            label: "制限速度",
            borderColor: "rgba(0,0,0,0.5)",
            pointRadius: 0,
            data: resultLimitSpeed
        }, {
            label: "時間",
            borderColor: "rgba(127,0,0,0.0)",
            pointRadius: 1,
            data: resultTimeArray
        }]
    }
    let options = {
        animation: false
    };
    const ctx = document.getElementById("myChart").getContext("2d");

    if (myChart != null)
        myChart.destroy();
    myChart = new Chart(ctx, {
        type: type,
        data: data,
        options: options
    });

    document.getElementById("error").innerHTML = "処理完了";
}