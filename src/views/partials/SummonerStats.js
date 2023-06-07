import {rootAddress} from '../../config/config';

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import axios from "axios";
import { getRoleName, getQueueName } from "../../utils/riotCDN";
import LoadingCircle from "../components/LoadingCircle";

function SummonerStats(props) {
  const [stats, setStats] = useState('no stats found');

  const [mode, setMode] = useState('any');
  const [modeList, setModeList] = useState(['any']);

  const [role, setRole] = useState('any');
  const [roleList, setRoleList] = useState(['any']);

  const [champ, setChamp] = useState('any');

  //used to set and determine how many games to limit stats results to. 
  //limitlist contains a set available numbers to limit to, capping at the max games that exist
  const [limit, setLimit] = useState(10);
  const [limitList, setLimitList] = useState([0]);

  const [modeIsLoading, setModeIsLoading] = useState([]);
  const [limitIsLoading, setLimitIsLoading] = useState([]);
  const [roleIsLoading, setRoleIsLoading] = useState([]);

  const { region, name } = useParams();


  useEffect(() => {
 
    setModeIsLoading(true);
    //get number of games that fit current selection
    axios
    .get(rootAddress[process.env.NODE_ENV] + `/api/matches/stats/${champ}/${role}/${mode}/queueId/10000/any/${region}/${name}`)
    .then((res) => {
      let limits = [];
      let hardLimit = res.data.length;
      if(hardLimit > 4 && hardLimit < 10){
        limits.push(5);
      }
      if(hardLimit > 9){
        limits.push(10);
      }
      if(hardLimit > 55){
        limits.push(50);
      }
      if(hardLimit > 105){
        limits.push(100);
      }
      if(hardLimit > 0){
        limits.push(hardLimit);
      }
      setLimitList(limits); 
      setLimitIsLoading(false);
    })
    .catch((err) => {
      setLimitList([0]); 
      setLimitIsLoading(false);
      console.log("Error from SummonerDetails");
    });
    //get list of modes played, returns queue IDs
    axios
      .get(rootAddress[process.env.NODE_ENV] + `/api/matches/stats/${champ}/${role}/any/queueId/${limit}/unique/${region}/${name}`)
      .then((res) => {
        res.data.push('any');
        setModeList(res.data); 
        setModeIsLoading(false);
      })
      .catch((err) => {
        setModeList(['any']); 
        setModeIsLoading(false);
        console.log("Error from SummonerDetails");
      });
    //get list of roles played, returns role IDs
      axios
      .get(rootAddress[process.env.NODE_ENV] + `/api/matches/stats/${champ}/any/${mode}/teamPosition/${limit}/unique/${region}/${name}`)
      .then((res) => {
        res.data.push('any');
        setRoleList(res.data); 
        setRoleIsLoading(false);
      })
      .catch((err) => {
        setRoleList(['any']); 
        setRoleIsLoading(false);
        console.log("Error from SummonerDetails");
      });
  }, [champ, role, mode, limit, region, name]);
   


  const onLimitUpdate = (e) => {
    setLimit(e.target.value);
  };

  function LimitFilter(){
    let options = [];
    let key = 0;
    for (let limitNum of limitList){
      if(limitNum !== ''){
        if(limitNum === limitList.slice(-1)[0]){
          options.push(<option key = {key++} value={limitNum} > All games ({limitNum})</option>);
        }else{
          options.push(<option key = {key++} value={limitNum} >{limitNum}</option>);
        }
      }
    }
    
    return(
        <select className = "limit-filter" onChange={onLimitUpdate} value={limit}>
           {options}
        </select>
    );
    
  }

  const onPositionUpdate = (e) => {
    setRole(e.target.value);
  };

  function PositionFilter(){
    let options = [];
    let key = 0;
    for (let roleId of roleList){
      if(roleId !== ''){
        if(roleId === 'any'){
          options.push(<option key = {key++} value={roleId} >All roles</option>);
        }else{
          options.push(<option key = {key++} value={roleId} >{getRoleName(roleId)}</option>);
        }
      }
    }
    
    return(
        <select className = "position-filter" onChange={onPositionUpdate} value={role}>
            {options}
        </select>
    );
    
  }

  const onModeUpdate = (e) => {
    setMode(e.target.value);
  };

  function ModeFilter(){
    let options = [];
    let key = 0;
    for (let modeId of modeList){
      if(modeId === 'any'){
        options.push(<option key = {key++} value={modeId} >All game modes</option>);
      }else{
      options.push(<option key = {key++} value={modeId} >{getQueueName(modeId)}</option>);
      }
    }
    
    return(
        <select className = "mode-filter" onChange={onModeUpdate} value={mode}>
            {options}
        </select>
    );
    
  }

  const onReset = (e) => {
    setMode('any');
    setRole('any');
    setLimit(10);
  };

    return (
      <div className="summoner-stats">
        <div className="filters">
            <LimitFilter />
            <ModeFilter />
            <PositionFilter />
            <a className = "reset-filter" href = "#" onClick={onReset}>Reset Filters</a>
        </div>
        <div className="stats">
            <StatCard stat = {"win"} title = {"Win Rate"} display = {"percentage"} aggr = {"avg"} champ = {champ} role = {role} mode = {mode} limit = {limit} region = {region} name = {name}/>
            <StatCard stat = {"visionScore"} title = {"Avg. Vision Score"} display = {"average"} aggr = {"avg"} champ = {champ} role = {role} mode = {mode} limit = {limit} region = {region} name = {name}/>
            <StatCard stat = {"challenges/visionScorePerMinute"} title = {"Vision per min."} display = {"average"} aggr = {"avg"} champ = {champ} role = {role} mode = {mode} limit = {limit} region = {region} name = {name}/>
            <StatCard stat = {"challenges/kda"} title = {"Avg. KDA"} display = {"average"} aggr = {"avg"} champ = {champ} role = {role} mode = {mode} limit = {limit} region = {region} name = {name}/>
            <StatCard stat = {"challenges/soloKills"} title = {"Avg. Solo Kills"} display = {"average"} aggr = {"avg"} role = {role} champ = {champ} mode = {mode} limit = {limit} region = {region} name = {name}/>
        </div>
      </div>
    );
}

function StatCard(props){
  const [stat, setStat] = useState('no stats found');
  const statProp = props.stat;
  const aggregation = props.aggr;
  const champ = props.champ;
  const role = props.role;
  const mode = props.mode;
  const limit = props.limit;
  const region = props.region;
  const name = props.name;
  const [isLoading, setIsLoading] = useState([]);
  useEffect(() => {
    setIsLoading(true);
    axios
      .get(rootAddress[process.env.NODE_ENV] + `/api/matches/stats/${champ}/${role}/${mode}/${statProp}/${limit}/${aggregation}/${region}/${name}`)
      .then((res) => {
        setStat(res.data); 
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("Error from SummonerDetails");
      });
  }, [statProp, aggregation, champ, role, mode, limit, region, name]);

  if (isLoading) {
   return (
    <div className="summoner-stat-card">
       <LoadingCircle color={"gold"} size = {"small"} aspectRatio={"short-rectangle"} />
     </div>
   );
 } else {
   return (
     <div className="summoner-stat-card">
      <div className="title">
           {props.title}
       </div>
       <div className="stat">
           {stat.toFixed(2)}
       </div>
     </div>
   );
 }
 }



export default SummonerStats;
