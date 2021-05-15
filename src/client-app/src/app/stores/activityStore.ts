import {makeAutoObservable, runInAction} from 'mobx'
import { Activity } from '../models/activity';
import agent from '../api/agent';


export default class ActivityStore {
    activities:Activity[]=[];
    selectedActivity:Activity|undefined =undefined;
    editMode:boolean=false;
    loading:boolean=false;
    loadingInitial:boolean=false;

    constructor() {
        makeAutoObservable(this);    
    }
    loadActivities = async () => {
        this.loadingInitial = true;
        try {
            const activities:Activity[]= await agent.Activities.list();
            activities.forEach(activity => {
                activity.date=activity.date.split('T')[0];
                this.activities.push(activity);
            })
            this.loadingInitial = false;
        } catch (error) {
            console.log(error);
            this.loadingInitial = false;
        }
    }
    setLoadingInitial =(state:boolean)=>{
        this.loadingInitial=state;
    }
    selectActivity=(id:string)=>{
        this.selectedActivity=this.activities.find(a=>a.id===id);
    }
    cancelSelectedActivity=()=>{
        this.selectedActivity=undefined;
    }
    openForm=(id?: string)=>{
        id ?this.selectActivity(id):this.cancelSelectedActivity();
        this.editMode=true;
    }
    closeForm=()=>{
        this.editMode=false;  
    }
    createActivity=async (activity:Activity)=>{
        this.loading=true;
        try{
            await agent.Activities.create(activity);
            runInAction(()=>{
                this.activities.push(activity);
                this.selectedActivity=activity;
                this.editMode=false;
                this.loading=false;
            })
        }catch(err){
            console.log(err);
            runInAction(()=>{
                this.loading=false;
            })
        }
    }
    updateActivity=async(activity:Activity)=>{
        this.loading=true;
        try {
            await agent.Activities.update(activity);
            runInAction(()=>{
                this.activities=[...this.activities.filter(a=>a.id!==activity.id),activity];
                this.selectedActivity=activity;
                this.editMode=false;
                this.loading=false;
            })  
        } catch (err) {
            console.log(err);
            runInAction(()=>{
                this.loading=false;
            }) 
        }
    }

    // deleteActivity=async(id:string)=>{
    //     this.loading=true;
    //     try {
    //         runInAction(()=>{
    //             this.activities=[...this.activities.filter(a=>a.id!==id)];
    //             this.cancelSelectedActivity;
    //             this.editMode=false;
    //             this.loading=false;
    //         })  
    //     } catch (err) {
    //         console.log(err);
    //         runInAction(()=>{
    //             this.loading=false;
    //         }) 
    //     }
    // }
}
