import React, { useEffect, useState } from 'react';
import {
    Box,
    Drawer,
    Typography,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Checkbox,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../../hooks/useApi';

interface Props {
    open: boolean;
    onClose: () => void;
}

interface User {
    id: string;
    username: string;
    employee_number: string;
    department: string;
}

const GroupCreateDrawer: React.FC<Props> = ({ open, onClose }) => {
    const { post, get, put } = useApi();
    const queryClient = useQueryClient();

    const [step, setStep] = useState<1 | 2>(1);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [groupId, setGroupId] = useState<string | null>(null);
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    const handleClose = () => {
        onClose();
        setStep(1);
        setName('');
        setDescription('');
        setGroupId(null);
        setAvailableUsers([]);
        setSelectedUserIds([]);
    };

    const handleNextStep = async () => {
        if (!name.trim()) {
            alert('그룹명을 입력해주세요.');
            return;
        }

        try {
            // 1. 그룹 생성
            const res = await post<{ id: string }>(
                `/groups`,
                null,
                { params: { group_name: name, description } }
            );

            const newGroupId = res.id;
            setGroupId(newGroupId);

            // 2. 구성원 조회
            const usersRes = await get<{ data: User[] }>(`/groups/${newGroupId}/user-available`);
            setAvailableUsers(usersRes.data);

            setStep(2);
        } catch {
            alert('그룹 생성 또는 사용자 목록 조회에 실패했습니다.');
        }
    };

    const handleSave = async () => {
        if (!groupId) return;

        try {
            for (const userId of selectedUserIds) {
                await put(`/groups/${groupId}/user-mappings`, null, {
                    params: { user_id: userId },
                });
            }

            alert('그룹이 생성되었습니다.');
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            handleClose();
        } catch {
            alert('구성원 추가에 실패했습니다.');
        }
    };

    const handleUserToggle = (id: string) => {
        setSelectedUserIds((prev) =>
            prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
        );
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={handleClose}
            PaperProps={{ sx: { width: '50%' } }}
        >
            <Box p={3}>
                {step === 1 && (
                    <>
                        <Typography variant="h6" fontWeight={700} mb={2}>새 그룹 만들기</Typography>
                        <TextField
                            fullWidth
                            label="그룹명"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="설명"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            margin="normal"
                        />
                        <Box display="flex" justifyContent="flex-end" mt={3}>
                            <Button onClick={handleClose} sx={{ mr: 1 }}>취소</Button>
                            <Button variant="contained" onClick={handleNextStep}>다음</Button>
                        </Box>
                    </>
                )}

                {step === 2 && (
                    <>
                        <Typography variant="h6" fontWeight={700} mb={2}>구성원 선택</Typography>
                        <Typography variant="body2" mb={2}>그룹에 추가할 사용자를 선택하세요.</Typography>

                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox"></TableCell>
                                    <TableCell>No</TableCell>
                                    <TableCell>이름</TableCell>
                                    <TableCell>행번</TableCell>
                                    <TableCell>부서</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {availableUsers.map((user, idx) => (
                                    <TableRow key={user.id}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedUserIds.includes(user.id)}
                                                onChange={() => handleUserToggle(user.id)}
                                            />
                                        </TableCell>
                                        <TableCell>{idx + 1}</TableCell>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>{user.employee_number}</TableCell>
                                        <TableCell>{user.department}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <Box display="flex" justifyContent="flex-end" mt={3}>
                            <Button onClick={handleClose} sx={{ mr: 1 }}>취소</Button>
                            <Button variant="contained" onClick={handleSave}>생성</Button>
                        </Box>
                    </>
                )}
            </Box>
        </Drawer>
    );
};

export default GroupCreateDrawer;