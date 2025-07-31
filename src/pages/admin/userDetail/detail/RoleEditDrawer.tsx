import React, { useState } from 'react';
import {
    Drawer,
    Box,
    Typography,
    TextField,
    Button,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../../../hooks/useApi';

interface Props {
    open: boolean;
    onClose: () => void;
    roleName: string;
    initialDescription: string;
}

const CLIENT_ID = 'acb004f3-5ffc-49bc-900f-a1c390c1d077';

const RoleEditDrawer: React.FC<Props> = ({
                                             open,
                                             onClose,
                                             roleName,
                                             initialDescription,
                                         }) => {
    const queryClient = useQueryClient();
    const { put } = useApi();

    const [newRoleName, setNewRoleName] = useState(roleName);
    const [description, setDescription] = useState(initialDescription);

    const updateMutation = useMutation({
        mutationFn: () =>
            put(`/api/v1/projects/${CLIENT_ID}/roles/${roleName}`, null, {
                params: {
                    name: newRoleName,
                    description,
                },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            onClose();
        },
        onError: () => {
            alert('수정에 실패했습니다.');
        },
    });

    return (
        <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: '50%' } }}>
            <Box p={3}>
                <Typography variant="h6" mb={2}>역할 정보 수정</Typography>

                <TextField
                    fullWidth
                    label="역할명"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="설명"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    margin="normal"
                    multiline
                    rows={3}
                />

                <Box display="flex" justifyContent="flex-end" mt={3} gap={1}>
                    <Button onClick={onClose}>취소</Button>
                    <Button variant="contained" onClick={() => updateMutation.mutate()} disabled={!newRoleName}>
                        저장
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
};

export default RoleEditDrawer;