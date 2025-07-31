import React, { useState } from 'react';
import {
    Box,
    Button,
    Drawer,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Switch,
    FormControlLabel,
    RadioGroup,
    Radio,
    IconButton,
    InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useApi } from '../../../hooks/useApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Props {
    open: boolean;
    onClose: () => void;
}

const SafetyFilterCreateDrawer: React.FC<Props> = ({ open, onClose }) => {
    const { post } = useApi();
    const queryClient = useQueryClient();

    const [project, setProject] = useState('');
    const [stopword, setStopword] = useState('');
    const [description, setDescription] = useState('');
    const [label, setLabel] = useState('Unsafe_user_defined');
    const [category, setCategory] = useState('none');
    const [scope, setScope] = useState<'all' | 'noun_only'>('all');
    const [exceptions, setExceptions] = useState<string[]>([]);
    const [exceptionInput, setExceptionInput] = useState('');
    const [isActive, setIsActive] = useState(true);

    const createFilter = useMutation({
        mutationFn: () =>
            post('/safety-filters', {
                project,
                stopword,
                description,
                label,
                category,
                scope,
                exception_sources: exceptions,
                status: isActive ? 'ACTIVE' : 'INACTIVE',
                policy: [
                    {
                        decision_strategy: 'UNANIMOUS',
                        logic: 'POSITIVE',
                        policies: [
                            {
                                type: 'user',
                                logic: 'POSITIVE',
                                names: ['admin'],
                            },
                        ],
                        scopes: ['GET', 'POST', 'PUT', 'DELETE'],
                    },
                ],
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['safetyFilters'] });
            onClose();
            resetForm();
            window.location.reload();
        },
        onError: () => {
            alert('규칙 생성에 실패했습니다.');
        },
    });

    const resetForm = () => {
        setProject('');
        setStopword('');
        setDescription('');
        setCategory('none');
        setExceptions([]);
        setIsActive(true);
    };

    const handleAddException = () => {
        if (exceptionInput.trim()) {
            setExceptions((prev) => [...prev, exceptionInput.trim()]);
            setExceptionInput('');
        }
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: '50%' } }}>
            <Box p={3}>
                <Typography variant="h6" gutterBottom>
                    새 규칙 만들기
                </Typography>
                <Typography variant="body2" mb={2}>
                    금지어와 필터링 조건을 설정하여 규칙을 만들어 보세요.
                </Typography>

                <FormControl fullWidth margin="normal">
                    <InputLabel>프로젝트</InputLabel>
                    <Select value={project} onChange={(e) => setProject(e.target.value)} label="프로젝트">
                        <MenuItem value="">선택</MenuItem>
                        <MenuItem value="default">default</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    fullWidth
                    label="금지어"
                    value={stopword}
                    onChange={(e) => setStopword(e.target.value)}
                    margin="normal"
                    placeholder="차단할 키워드를 입력해주세요."
                />

                <TextField
                    fullWidth
                    label="설명"
                    multiline
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    margin="normal"
                />

                <FormControl fullWidth margin="normal">
                    <InputLabel>라벨</InputLabel>
                    <Select value={label} onChange={(e) => setLabel(e.target.value)} label="라벨">
                        <MenuItem value="Unsafe_user_defined">Unsafe_user_defined</MenuItem>
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <InputLabel>분류</InputLabel>
                    <Select value={category} onChange={(e) => setCategory(e.target.value)} label="분류">
                        <MenuItem value="none">없음</MenuItem>
                        <MenuItem value="famous">Famous</MenuItem>
                    </Select>
                </FormControl>

                <Typography variant="subtitle2" mt={2}>필터링 범위</Typography>
                <RadioGroup
                    row
                    value={scope}
                    onChange={(e) => setScope(e.target.value as 'all' | 'noun_only')}
                >
                    <FormControlLabel value="all" control={<Radio />} label="전체 검사" />
                    <FormControlLabel value="noun_only" control={<Radio />} label="명사만 검사" />
                </RadioGroup>

                <Typography variant="subtitle2" mt={3}>예외 출처 설정</Typography>
                <Box display="flex" gap={1} alignItems="center">
                    <TextField
                        fullWidth
                        placeholder="예외 출처 도메인 입력"
                        value={exceptionInput}
                        onChange={(e) => setExceptionInput(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleAddException}>
                                        <AddIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
                {exceptions.map((url, idx) => (
                    <Typography key={idx} variant="body2" ml={1} mt={0.5}>
                        - {url}
                    </Typography>
                ))}

                <FormControlLabel
                    sx={{ mt: 3 }}
                    control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
                    label="규칙 사용하기"
                />

                <Box display="flex" justifyContent="flex-start" mt={3} gap={1}>
                    <Button onClick={onClose}>취소</Button>
                    <Button
                        variant="contained"
                        disabled={!project || !stopword}
                        onClick={() => createFilter.mutate()}
                    >
                        만들기
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
};

export default SafetyFilterCreateDrawer;