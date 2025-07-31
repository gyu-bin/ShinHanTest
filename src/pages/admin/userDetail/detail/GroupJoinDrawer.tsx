import React, { useState } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    CircularProgress,
    Alert,
    Menu,
    MenuItem,
    Tooltip,
    Button,
    Drawer,
    Typography,
    Checkbox,
    TextField,
    InputAdornment,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../../../hooks/useApi';

interface Group {
    id: string;
    name: string;
    path: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    userId: string;
}

const GroupJoinDrawer: React.FC<Props> = ({ open, onClose, userId }) => {
    const { get, put } = useApi();
    const queryClient = useQueryClient();
    const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
    const [search, setSearch] = useState('');

    const { data: availableGroups = [], isLoading } = useQuery({
        queryKey: ['availableGroups', userId],
        queryFn: async () => {
            const res = await get<{ data: Group[] }>(
                `/users/${userId}/group-available`
            );
            return res.data;
        },
        enabled: open,
    });

    const assignMutation = useMutation({
        mutationFn: async () => {
            return Promise.all(
                selectedGroupIds.map((group_id) =>
                    put(`/users/${userId}/group-mappings?group_id=${group_id}`)
                )
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userGroups', userId] });
            onClose(); // ✅ 부모에서 닫기
            setSelectedGroupIds([]);
        },
        onError: () => {
            alert('저장에 실패했습니다.');
        },
    });

    const toggleSelect = (id: string) => {
        setSelectedGroupIds((prev) =>
            prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
        );
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
                    그룹 참여하기
                </Typography>
                <Typography variant="body2" mb={2}>
                    사용자에게 할당하고자 하는 그룹을 선택해주세요.
                </Typography>

                <TextField
                    fullWidth
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="그룹명 검색"
                    margin="normal"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox"></TableCell>
                            <TableCell>No</TableCell>
                            <TableCell>그룹명</TableCell>
                            <TableCell>설명</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {availableGroups
                            .filter((g) => g.name.includes(search))
                            .map((g, idx) => (
                                <TableRow key={g.id}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedGroupIds.includes(g.id)}
                                            onChange={() => toggleSelect(g.id)}
                                        />
                                    </TableCell>
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell>{g.name}</TableCell>
                                    <TableCell>{g.path}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>

                <Box display="flex" justifyContent="flex-start" mt={3} gap={1}>
                    <Button onClick={onClose}>취소</Button>
                    <Button
                        variant="contained"
                        disabled={selectedGroupIds.length === 0}
                        onClick={() => assignMutation.mutate()}
                    >
                        저장
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
};

export default GroupJoinDrawer;