const runcurve = {
    // 1mごとのトンネル情報を求める関数
    // tunnels: トンネル情報
    // length: 戻り値の長さ
    // startLength: 開始位置
    // => 1mごとのトンネル情報
    getTunnelInfo: (tunnels, length, startLength) => {
        let result = new Array(length);
        for (let i = 0; i < result.length; i++)
            result[i] = 0;
            for (let i = 0; i < tunnels.length; i++)
            {
                for (let j = tunnels[i][0]; j < tunnels[i][1]; j++)
                { // 開始地点から終了地点まで舐める
                    result[j - startLength] = tunnels[i][2];
                }
            }
        return result;
    },
    // 1mごとの曲線半径情報を求める関数
    // curves: 曲線情報
    // length: 戻り値の長さ
    // startLength: 開始位置
    // => 1mごとの曲線情報
    getCurveInfo: (curves, length, startLength) => {
        let result = new Array(length);
        for (let i = 0; i < result.length; i++)
            result[i] = 0;
        for (let i = 0; i < curves.length; i++)
        {
            for (let j = curves[i][0]; j < curves[i][1]; j++)
            { // 開始地点から終了地点まで舐める
                result[j - startLength] = curves[i][2];
            }
        }
        return result;
    },
    // 1mごとの勾配情報を求める関数
    // gradients: 勾配情報
    // length: 戻り値の長さ
    // startLength: 開始位置
    // => 1mごとの勾配情報
    getGradientInfo: (gradients, length, startLength) => {
        let result = new Array(length);
        for (let i = 0; i < result.length; i++)
            result[i] = 0;
        for (let i = 0; i < gradients.length; i++)
        {
            for (let j = gradients[i][0]; j < gradients[i][1]; j++)
            { // 開始地点から終了地点まで舐める
                result[j - startLength] = gradients[i][2];
            }
        }
        return result;
    },
    // 加速した際の1m先の速度を求める関数
    // currentSpeed: 現在の速度
    // tractiveForces: 1km/hごとの引張力
    // runningResistance: 1km/hごとの走行抵抗
    // radius: 曲線半径
    // gradient: 勾配
    // tunnel: トンネル種別
    // => 速度(km/h)
    getAccelNextSpeed: (currentSpeed, vehicle, radius, gradient, tunnel) => {
        // force: kgf/t
        let force = (vehicle.tractiveForces[Math.floor(currentSpeed)] - vehicle.runningResistance[Math.floor(currentSpeed)]) / 
            (vehicle.mCars*vehicle.mWeight + vehicle.tCars*vehicle.tWeight);
        force -= tunnel + gradient;
        if (radius != 0)
            force -= 800/radius;

        let acceleration = force / 30.9;
        return Math.sqrt((currentSpeed/3.6)**2 + (2 * acceleration/3.6))*3.6;
    },
    // 減速した際の1m前の速度を求める関数
    // currentSpeed: 現在の速度
    // tractiveForces: 1km/hごとの引張力
    // runningResistance: 1km/hごとの走行抵抗
    // radius: 曲線半径
    // gradient: 勾配
    // tunnel: トンネル種別
    // => 速度(km/h)
    getDecelBeforeSpeed: (currentSpeed, vehicle, radius, gradient, tunnel) => {
        // force: kgf/t
        let force = -vehicle.runningResistance[Math.floor(currentSpeed)] / 
            (vehicle.mCars*vehicle.mWeight + vehicle.tCars*vehicle.tWeight);
        force -= tunnel + gradient -(vehicle.deceleration*30.9);
        if (radius != 0)
            force -= 800/radius;

        let acceleration = force / 30.9;
        return Math.sqrt((currentSpeed/3.6)**2 + (2 * acceleration/3.6))*3.6;
    },
    // 減速した際の1m先の速度を求める関数
    // currentSpeed: 現在の速度
    // tractiveForces: 1km/hごとの引張力
    // runningResistance: 1km/hごとの走行抵抗
    // radius: 曲線半径
    // gradient: 勾配
    // tunnel: トンネル種別
    // => 速度(km/h)
    getDecelNextSpeed: (currentSpeed, vehicle, radius, gradient, tunnel) => {
        // force: kgf/t
        let force = -vehicle.runningResistance[Math.floor(currentSpeed)] / 
            (vehicle.mCars*vehicle.mWeight + vehicle.tCars*vehicle.tWeight);
        force -= tunnel + gradient +(vehicle.deceleration*30.9);
        if (radius != 0)
            force -= 800/radius;

        let acceleration = force / 30.9;
        return Math.sqrt((currentSpeed/3.6)**2 + (2 * acceleration/3.6))*3.6;
    },
    // 惰行した際の1m先の速度を求める関数
    // currentSpeed: 現在の速度
    // tractiveForces: 1km/hごとの引張力
    // runningResistance: 1km/hごとの走行抵抗
    // radius: 曲線半径
    // gradient: 勾配
    // tunnel: トンネル種別
    // => 速度(km/h)
    getCoastingNextSpeed: (currentSpeed, vehicle, radius, gradient, tunnel) => {
        let force = (-vehicle.runningResistance[Math.floor(currentSpeed)]) / 
            (vehicle.mCars*vehicle.mWeight + vehicle.tCars*vehicle.tWeight);
        force -= tunnel + gradient;
        if (radius != 0)
            force -= 800/radius;

        let acceleration = force / 30.9;
        return Math.sqrt((currentSpeed/3.6)**2 + (2 * acceleration/3.6))*3.6;
    },
    // 駅間の速度を求める関数
    // route: 計算する路線オブジェクト
    // vehicle: 計算する車両オブジェクト
    // startStaIndex: 計算する駅
    // => 1mごとの速度[km/h]
    getSpeed: (route, vehicle, startStaIndex) => {
        let startLength = route.stations[startStaIndex].position;
        let endLength = route.stations[startStaIndex+1].position;
        let result = new Array(endLength - startLength); // km/h
        let tunnel = runcurve.getTunnelInfo(route.tunnels, endLength - startLength, startLength); // tunnel type
        let curve = runcurve.getCurveInfo(route.curves, endLength - startLength, startLength); // m
        let gradient = runcurve.getGradientInfo(route.gradients, endLength - startLength, startLength); // ‰
        
        // 駅最高速度を代入
        result.fill(route.stations[startStaIndex].maxSpeed);
        
        { // 制限速度
            for (let i = 0; i < route.limitSpeeds.length; i++)
            {
                for (let j = route.limitSpeeds[i][0]; j < route.limitSpeeds[i][1]; j++)
                { // 開始地点から終了地点までを計算
                    if (result[j - startLength] >= route.limitSpeeds[i][2])
                        result[j - startLength] = route.limitSpeeds[i][2];
                }
            }
        }

        let curveChangePoint = [[0, route.stations[startStaIndex].maxSpeed]]; // 制限速度が変わる地点
        { // 
            let before = result[0];
            for (let i = 0; i < result.length; i++)
            {
                if (before != result[i])
                {
                    curveChangePoint.push([i, result[i]]);
                    before = result[i];
                }
            }
        }

        { // 惰行パターン
            let cChangePoint = [ ...curveChangePoint, [result.length, 0] ];
            let spareSpeed = 2; // 制限速度よりも低く設定する
            let isAccel = false; // 特定の速度を下回ると再加速する
            let isBrake = false; // 制限速度を上回るとブレーキ掛ける
            
            for (let i = 0; i < curveChangePoint.length; i++)
            {
                let previous = cChangePoint[i][1] - spareSpeed;
                for (let j = 0; j < (cChangePoint[i+1][0] - cChangePoint[i][0]); j++ )
                {
                    let speed = 0;
                    if (isAccel)
                        speed = runcurve.getAccelNextSpeed(previous, vehicle, curve[j+cChangePoint[i][0]], gradient[j+cChangePoint[i][0]], tunnel[j+cChangePoint[i][0]]);
                    else if (isBrake)
                        speed = runcurve.getDecelNextSpeed(previous, vehicle, curve[j+cChangePoint[i][0]], gradient[j+cChangePoint[i][0]], tunnel[j+cChangePoint[i][0]]);
                    else
                        speed = runcurve.getCoastingNextSpeed(previous, vehicle, curve[j+cChangePoint[i][0]], gradient[j+cChangePoint[i][0]], tunnel[j+cChangePoint[i][0]]);
                    result[j+cChangePoint[i][0]] = speed;
                    previous = speed;
                    if (speed < (cChangePoint[i][1] - 10)) // 制限-10km/hになったら再加速
                    {
                        isAccel = true;
                    }
                    if (speed > (cChangePoint[i][1] - spareSpeed)) // 制限-2km/hになったら加速終了
                    {
                        isAccel = false;
                    }
                    if (speed > cChangePoint[i][1] - (spareSpeed/2)) // 制限-1km/hになったら制動
                    {
                        isBrake = true;
                    }
                    if (speed < (cChangePoint[i][1] - 5)) // 制限-5km/hになったら制動終了
                    {
                        isBrake = false;
                    }
                }
            }
            
        }

        { // 駅加速
            let i = 1;
            let previous = 0;
            result[0] = 0;
            while (true)
            {
                if (i > result.length)
                    break;
                let speed = runcurve.getAccelNextSpeed(previous, vehicle, curve[i], gradient[i], tunnel[i]);
                if (previous > result[i])
                    break;
                result[i] = speed;
                previous = speed;
                i++
            }
        }
        { // 駅減速
            let i = 1;
            let previous = 0;
            result[result.length-1] = 0;
            while (true)
            {
                if (i > result.length)
                    break;
                let speed = runcurve.getDecelBeforeSpeed(previous, vehicle, curve[i], gradient[i], tunnel[i]);
                if (previous > result[result.length-i])
                    break;
                result[result.length-i] = speed;
                previous = speed;
                i++;
            }
        }

        { // 制限からの加速パターン
            for (let j = 1; j < curveChangePoint.length; j++)
            {
                let i = curveChangePoint[j][0];
                let previous = result[i-1];
                while (true)
                {
                    if (i > result.length)
                        break;
                    let speed = runcurve.getAccelNextSpeed(previous, vehicle, curve[i], gradient[i], tunnel[i]);
                    if (previous > result[i])
                        break;
                    result[i] = speed;
                    previous = speed;
                    i++
                }
            }
        }

        { // 制限からの減速パターン
            for (let j = 1; j < curveChangePoint.length; j++)
            {
                let i = curveChangePoint[j][0];
                let previous = result[i];
                while (true)
                {
                    if (i > result.length)
                        break;
                    let speed = runcurve.getDecelBeforeSpeed(previous, vehicle, curve[i], gradient[i], tunnel[i]);
                    if (previous > result[i])
                        break;
                    result[i] = speed;
                    previous = speed;
                    i--;
                }
                
            }
        }

        return result;
    },
    // 駅間の制限速度を求める関数
    // route: 計算する路線オブジェクト
    // vehicle: 計算する車両オブジェクト
    // startStaIndex: 計算する駅
    // => 1mごとの制限速度[km/h]
    getLimitSpeed: (route, vehicle, startStaIndex) => {
        let startLength = route.stations[startStaIndex].position;
        let endLength = route.stations[startStaIndex+1].position;
        let result = new Array(endLength - startLength); // km/h

        { // 駅最高速度
            for (let i = 0; i < result.length; i++)
                result[i] = route.stations[startStaIndex].maxSpeed;
        }
        { // 制限速度
            for (let i = 0; i < route.limitSpeeds.length; i++)
            {
                for (let j = route.limitSpeeds[i][0]; j < route.limitSpeeds[i][1]; j++)
                { // 開始地点から終了地点までを制限速度に更新
                    if (result[j - startLength] > route.limitSpeeds[i][2])
                        result[j - startLength] = route.limitSpeeds[i][2];
                }
            }
        }
        return result;
    },
    // 速度の配列から時間の配列を求める関数
    // arr: 速度の配列[km/h]
    // => 時間の配列[累計秒]
    getTimeArray: (arr) => {
        let result = [];
        let sum = 0;
        for (let i = 0; i < arr.length; i++)
        {
            if (arr[i] == 0)
                continue;
            sum += (1 / (arr[i]/3.6));
            result.push(sum);
        }
        return result;
    },
    // 速度の配列から時間を求める関数
    // arr: 速度の配列[km/h]
    // => 時間[秒] 
    getTime: (arr) => {
        let sum = 0;
        for (let i = 0; i < arr.length; i++)
        {
            if (arr[i] == 0)
                continue;
            sum += (1 / (arr[i]/3.6));
        }
        return sum;
    }
};