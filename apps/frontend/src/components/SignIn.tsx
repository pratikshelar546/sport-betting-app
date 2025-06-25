"use client"
import React, { useRef, useState } from 'react'
import { Input } from './ui/Input';
import { ErrorLabel } from './ui/ErrorLabel';
import { Button } from './ui/Button';
import { toast } from 'react-toastify';
import axios from 'axios';
import { server } from '@/utlis/server';
import { useRouter } from 'next/navigation';

const Signin = () => {
    const name = useRef('');
    const email = useRef('');
    const password = useRef('');
    const phoneNumber = useRef('');
    const passwordCheck = useRef('');
    const route = useRouter();

    const [requriedError, setRequriedError] = useState({
        name: false,
        email: false,
        password: false,
        reEnteredPassword: false,
        phoneNumber: false,
        matchedPassword: false
    })

    const handleMatchPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        passwordCheck.current = value;
        if (!password.current) setRequriedError((prev) => ({ ...prev, password: true }))

        if (password.current.toLowerCase() !== value.toLowerCase()) {
            setRequriedError((prev) => ({ ...prev, matchedPassword: true }))
        } else {
            setRequriedError((prev) => ({ ...prev, matchedPassword: false }))
        }
    }

    const handleSubmit = async () => {

        const loading = toast.loading('Signing in...');
        if (!name.current) setRequriedError((prev) => ({ ...prev, name: true }))
        if (!email.current) setRequriedError((prev) => ({ ...prev, email: true }))
        if (!password.current) setRequriedError((prev) => ({ ...prev, password: true }))
        if (!phoneNumber.current) setRequriedError((prev) => ({ ...prev, phoneNumber: true }))
        if (password.current.toLowerCase() !== passwordCheck.current.toLowerCase()) {
            setRequriedError((prev) => ({ ...prev, matchedPassword: true }))
        }


        if (!name.current || !email.current || !password.current || !phoneNumber.current) {
            toast.dismiss(loading);
            toast.error('Please fill all the required fields');
            return;
        }
        if (password.current.toLowerCase() !== passwordCheck.current.toLowerCase()) {
            toast.dismiss(loading);
            toast.error('Password did not match');
            return;
        }
        const data = {
            name: name.current,
            email: email.current,
            password: password.current,
            phoneNumber: String(phoneNumber.current),
        }
        try {

            const addUser = await server.post(`/user/signin`, data);

            if (addUser.data.success) {
                toast.dismiss(loading);
                toast.success(addUser.data.message);
                route.push("/login");
            }
        } catch (error: any) {
            toast.dismiss(loading);
            toast.error(error.response.data.message);

        }
        toast.dismiss(loading)

    }

    return (
        <section className='wrapper flex-col min-h-screen'>
            <div className='flex flex-col shadow-lg p-5 border-2 max-w-xl w-full h-full justify-center items-center'>
                <div className='text-center gap-2 flex flex-col ' >
                    <h1 className='text-base md:text-xl lg:text-4xl font-semibold '>Welcome to betting app</h1>
                    <p className='text-sm md:text-lg lg:text-xl '>You can win or lose betting on sports</p>
                </div>

                <div className='flex flex-col space-y-4 w-full p-5'>
                    <Input
                        type='text'
                        placeholder='Enter Name'
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => name.current = e.target.value}
                        label='Name'
                    />
                    <Input
                        type='email'
                        placeholder='Enter Email'
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => email.current = e.target.value}
                        label='Email'
                    />
                    <Input
                        type='number'
                        placeholder='Enter Phone number'
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => phoneNumber.current = e.target.value}
                        label='Phone Number'
                    />
                    <Input
                        type='password'
                        placeholder='Enter Password'
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => password.current = e.target.value}
                        label='Password'
                    />
                    <Input
                        type='password'
                        placeholder='Re-enter Password'
                        onChange={handleMatchPassword}
                        label='Re-enter password'
                    />
                    {requriedError.matchedPassword && <ErrorLabel message='Password did not match' />}

                    <Button
                        label='Sign In'
                        variant='primary'
                        size='lg'
                        className='w-full'
                        onClick={handleSubmit}
                    />
                </div>
            </div>
        </section>
    )
}

export default Signin