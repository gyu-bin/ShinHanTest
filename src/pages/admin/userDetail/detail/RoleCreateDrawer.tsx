// RoleCreateDrawer.tsx
import React, { useState } from 'react';
import {
    Box,
    Button,
    Drawer,
    Stepper,
    Step,
    StepLabel,
    TextField,
    Typography,
} from '@mui/material';
import { useApi } from '../../../../hooks/useApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Props {
    open: boolean;
    onClose: () => void;
    clientId: string;
}

const RoleCreateDrawer: React.FC<Props> = ({ open, onClose, clientId }) => {
    const { post } = useApi();
    const queryClient = useQueryClient();
    const [step, setStep] = useState(0);

    const [roleName, setRoleName] = useState('');
    const [description, setDescription] = useState('');
    const [permissions, setPermissions] = useState<string[]>([]); // 권한 추가 기능은 추후 구현

    const createRole = useMutation({
        mutationFn: () =>
            post(`/projects/${clientId}/roles`, {
                name: roleName,
                description,
                permissions, // 실제 구조에 따라 조정
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            onClose();
            resetForm();
        },
        onError: () => {
            alert('역할 생성에 실패했습니다.');
        },
    });

    const resetForm = () => {
        setStep(0);
        setRoleName('');
        setDescription('');
        setPermissions([]);
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{ sx: { width: '50%' } }}
        >
            <Box p={3}>
                <Typography variant="h6" gutterBottom>
                    새 역할 만들기
                </Typography>

                <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
                    <Step><StepLabel>기본 정보</StepLabel></Step>
                    <Step><StepLabel>권한 추가</StepLabel></Step>
                </Stepper>

                {step === 0 && (
                    <Box>
                        <TextField
                            fullWidth
                            label="역할명"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="설명"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            margin="normal"
                        />
                    </Box>
                )}

                {step === 1 && (
                    <Box>
                        {/* TODO: 권한 선택 UI 구성 (리스트, 체크박스 등) */}
                        <Typography>권한 선택 기능은 추후 구현 예정입니다.</Typography>
                    </Box>
                )}

                <Box display="flex" justifyContent="space-between" mt={4}>
                    <Button onClick={onClose}>취소</Button>
                    {step === 0 ? (
                        <Button
                            variant="contained"
                            disabled={!roleName}
                            onClick={() => setStep(1)}
                        >
                            다음
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={() => createRole.mutate()}
                        >
                            만들기
                        </Button>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
};

export default RoleCreateDrawer;