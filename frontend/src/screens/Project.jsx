import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "../config/axios";
import { initializeSocket, receiveMessage, sendMessage } from "../config/socket";

const Project = () => {
    const location = useLocation();

    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ project, setProject ] = useState(location.state.project);
    const [ selectedUserId, setSelectedUserId ] = useState(new Set());
    const [ users, setUsers] = useState([]);

    // Mock users data - replace with your actual users data
    // const users = [
    //     { id: 1, name: "John Doe", email: "john@example.com" },
    //     { id: 2, name: "Jane Smith", email: "jane@example.com" },
    //     { id: 3, name: "Mike Johnson", email: "mike@example.com" },
    //     { id: 4, name: "Emily Brown", email: "emily@example.com" },
    //     { id: 5, name: "David Wilson", email: "david@example.com" },
    //     { id: 6, name: "Sarah Davis", email: "sarah@example.com" },
    //     { id: 7, name: "Chris Davis", email: "chris@example.com" },
    //     { id: 8, name: "Jessica Taylor", email: "jessica@example.com" },
    // ];

    const handleUserClick = (id) => {
        setSelectedUserId(prevSelectedUserId => {
            const newSelectedUserId = new Set(prevSelectedUserId);
            if (newSelectedUserId.has(id)) {
                newSelectedUserId.delete(id);
            } else {
                newSelectedUserId.add(id);
            }

            return newSelectedUserId;
        });


    }


    function addCollaborators() {

        axios.put("/projects/add-user", {
            projectId: location.state.project._id,
            users: Array.from(selectedUserId)
        }).then(res => {
            console.log(res.data)
            setIsModalOpen(false)

        }).catch(err => {
            console.log(err)
        })

    }

    console.log(location.state);

    useEffect(() => {

        initializeSocket();

        if (!location.state?.project) {
            // You'll need to get the project ID from URL params instead
            const projectId = new URLSearchParams(location.search).get('id');
            
            if (projectId) {
                axios.get(`/projects/get-project/${projectId}`).then(res => {
                    console.log(res.data.project);
                    setProject(res.data.project);
                }).catch(err => {
                    console.log(err);
                });
            }
        }
    

        // axios.get(`/projects/get-project/${location.state.project._id}`).then(res => {

        //     console.log(res.data.project);

        //     setProject(res.data.project);
        //     // setFileTree(res.data.project.fileTree || {})
        // })

        axios.get('/users/all').then(res => {
            setUsers(res.data.users);
            setProject(res.data.project);
        }).catch(err => {
            console.log(err);
        })
    }, [])


    return (
        <main className="h-screen w-screen flex">

            <section className="left relative h-full min-w-96 bg-slate-300 flex flex-col">

                <header className="flex justify-between items-center p-2 px-4 w-full bg-slate-100">
                    <button 
                        className="flex gap-2 hover:bg-slate-200 p-2 rounded-md transition-colors"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <i className="ri-user-add-line mr-1"></i>
                        <p>Add collaborator</p>
                    </button>

                    <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className="p-2">
                        <i className="ri-group-fill"></i>
                    </button>
                </header>

                <div className="conversation-area flex-grow flex flex-col">
                    <div className="message-box flex-grow flex flex-col gap-1 p-1">
                        <div className="message max-w-56 flex flex-col p-2 bg-slate-50 w-fit rounded-md">
                            <small className="opacity-65 text-xs">example@mail.com</small>
                            <p className="text-sm">Lorem ipsum dolor sit amet.</p>
                        </div>
                        <div className="ml-auto max-w-56 message flex flex-col p-2 bg-slate-50 w-fit rounded-md">
                            <small className="opacity-65 text-xs">example@mail.com</small>
                            <p className="text-sm">Lorem ipsum dolor sit amet.</p>
                        </div>
                    </div>
                    <div className="inputField w-full flex">
                        <input className="p-2 px-4 border-none outline-none flex-grow" type="text" placeholder="Enter message" />
                        <button className="px-5 bg-slate-950 text-white"><i className="ri-send-plane-fill"></i></button>
                    </div>
                </div>

                <div className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-all top-0 ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                    <header className='flex justify-between items-center px-4 p-2 bg-slate-200'>

                        <h1
                            className='font-semibold text-lg'
                        >Collaborators</h1>

                        <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className='p-2'>
                            <i className="ri-close-fill"></i>
                        </button>
                    </header>

                    <div className="users flex flex-col gap-2">

                        {project.users && project.users.map(user => {


                            return (
                                <div className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-2 items-center">
                                    <div className='aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600'>
                                        <i className="ri-user-fill absolute"></i>
                                    </div>
                                    <h1 className='font-semibold text-lg'>{user.email}</h1>
                                </div>
                            )


                        })}
                    </div>
                </div>
            </section>

            {/* User Selection Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-md w-96 max-w-full relative">
                        <header className='flex justify-between items-center mb-4'>
                            <h2 className='text-xl font-semibold'>Select User</h2>
                            <button onClick={() => setIsModalOpen(false)} className='p-2'>
                                <i className="ri-close-fill"></i>
                            </button>
                        </header>
                        <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
                            {users.map(user => (
                                <div key={user.id} className={`user cursor-pointer hover:bg-slate-200 ${Array.from(selectedUserId).indexOf(user._id) != -1 ? 'bg-slate-200' : ""} p-2 flex gap-2 items-center`} onClick={() => handleUserClick(user._id)}>
                                    <div className='aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600'>
                                        <i className="ri-user-fill absolute"></i>
                                    </div>
                                    <h1 className='font-semibold text-lg'>{user.email}</h1>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addCollaborators}
                            className='absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded-md'>
                            Add Collaborators
                        </button>
                    </div>
                </div>
            )}
        </main>
    )
}
export default Project