import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';
import { useMutation,useQueryClient } from '@tanstack/react-query';

const CreateUser: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { post } = useApi();

    const [form, setForm] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        first_name: '',
        last_name: '',
    });

    const [error, setError] = useState('');

    const createUser = useMutation({
        mutationFn: () =>
            post('/users/register', {
                username: form.username,
                password: form.password,
                email: form.email,
                first_name: form.first_name,
                last_name: form.last_name,
                roles: [],
                groups: [],
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userList'], exact: false });
            navigate('/admin/user-management');
        },
        onError: () => setError('사용자 생성에 실패했습니다.'),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        if (!form.username || !form.password || !form.confirmPassword) {
            setError('필수 항목을 입력해주세요.');
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }
        setError('');
        createUser.mutate();
    };

    return (
        <Box p={4}>
            <Typography variant="h6" fontWeight={700} mb={2}>
                사용자 생성
            </Typography>
            <Paper sx={{ p: 3 }}>
                <Stack spacing={2}>
                    {error && <Alert severity="error">{error}</Alert>}

                    <TextField
                        label="User Name"
                        name="username"
                        fullWidth
                        required
                        value={form.username}
                        onChange={handleChange}
                    />

                    <TextField
                        label="Password"
                        name="password"
                        type="password"
                        fullWidth
                        required
                        value={form.password}
                        onChange={handleChange}
                        helperText="8자 이상, 문자/숫자/기호 포함 권장"
                    />

                    <TextField
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        fullWidth
                        required
                        value={form.confirmPassword}
                        onChange={handleChange}
                    />

                    <TextField
                        label="Email"
                        name="email"
                        fullWidth
                        value={form.email}
                        onChange={handleChange}
                    />

                    <TextField
                        label="First Name"
                        name="first_name"
                        fullWidth
                        value={form.first_name}
                        onChange={handleChange}
                    />

                    <TextField
                        label="Last Name"
                        name="last_name"
                        fullWidth
                        value={form.last_name}
                        onChange={handleChange}
                    />

                    <Box display="flex" justifyContent="flex-end" gap={2}>
                        <Button variant="outlined" onClick={() => navigate(-1)}>
                            취소
                        </Button>
                        <Button variant="contained" onClick={handleSubmit}>
                            저장
                        </Button>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
};

export default CreateUser;