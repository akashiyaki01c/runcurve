// 車両データを表すクラス
class Vehicle
{
    constructor(name, tractiveForces, runningResistance, deceleration, mCars, tCars, mWeight, tWeight, maxSpeed)
    {
        // 車両名 "車両名"
        this.name = name;
        // 1km/hごとの引張力 [ 0km/h時の引張力, 1km/h時の引張力, .. ]
        this.tractiveForces = tractiveForces;
        // 1km/hごとの走行抵抗 [ 0km/h時の走行抵抗, 1km/h時の走行抵抗, .. ]
        this.runningResistance = runningResistance;
        // 減速度(km/h/s)
        this.deceleration = deceleration;
        // M車の両数
        this.mCars = mCars;
        // T車の両数
        this.tCars = tCars;
        // M車の重量(t)
        this.mWeight = mWeight;
        // T車の重量(t)
        this.tWeight = tWeight;
        // 最高速度(km/h)
        this.maxSpeed = maxSpeed;
    }
}

// デフォルトの走行抵抗を返す関数
// mCars/tCars: M車/T車の両数
// mWeight/tWeight: M車/T車の重量[t]
// maxSpeed: 最高速度[km/h]
// => 1km/h刻みの編成走行抵抗[kgf]
function defaultRunningResistance(mCars, tCars, mWeight, tWeight, maxSpeed)
{
    let result = [];
    for (let i = 0; i < maxSpeed; i++)
    {
        let motorCarResistance = (1.65 + 0.0247 * i) * (mCars*mWeight);
        let trailerCarResistance = (0.78 + 0.028 * i) * (tCars*tWeight);
        let airResistance = (0.028 + 0.0078*(mCars + tCars - 1) * i**2);
        result.push((motorCarResistance + trailerCarResistance + airResistance));
    }
    // 出発抵抗を考慮
    result[0] += 3 * (mCars*mWeight + tCars*tWeight);
    result[1] += 2 * (mCars*mWeight + tCars*tWeight);
    result[2] += 1 * (mCars*mWeight + tCars*tWeight);

    return result;
}

// デフォルトの引張力曲線を返す関数(VVVF車)
// : cref https://sites.google.com/view/fwchbve/top/bveデータ公開以外/車両データ作成/性能の作り方vvvf編その1引張力計算
// startupAcceleration: 起動加速度[km/h/s]
// fixedTorqueSpeed: 定トルク領域終了速度[km/h]
// constantPowerSpeed: 定出力領域終了速度[km/h]
// maxSpeed: 最高速度[km/h]
// mCars/tCars: M車/T車の両数
// mWeight/tWeight: M車/T車の重量
// coefficient0/coefficient1: 定出力領域/特性領域の定数
// => 1km/h刻みの編成引張力曲線[kgf]
function defaultTractiveForce(
    startupAcceleration,
    fixedTorqueSpeed,
    constantPowerSpeed,
    maxSpeed,
    mCars, tCars, mWeight, tWeight,
    coefficient0, coefficient1,
    )
{
    let result = []; // kgf

    { // 定トルク領域 [0..fixedTorqueSpeed)
        // 編成重量[kg] * 起動加速度[m/s^2] / 9.807 = F[kgf]
        let fixedTorque = (startupAcceleration/3.6)*(mCars*mWeight + tCars*tWeight)*1000/9.807;
        for (let i = 0; i < fixedTorqueSpeed; i++)
        {
            result.push(fixedTorque);
        }
    }
    
    { // 定出力領域 [fixedTorqueSpeed..constantPowerSpeed)
        let constant = fixedTorqueSpeed**coefficient0 * result[result.length-1];
        for (let i = fixedTorqueSpeed; i < constantPowerSpeed; i++)
        {
            result.push(constant / i**coefficient0);
        }   
    }
    
    { // 特性領域 [constantPowerSpeed..maxSpeed)
        let constant = constantPowerSpeed**coefficient1 * result[result.length-1];
        for (let i = constantPowerSpeed; i < maxSpeed; i++)
        {
            result.push(constant / i ** coefficient1);
        }
    }

    return result;
}