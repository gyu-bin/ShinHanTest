import React, { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    IconButton,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Checkbox,
    CircularProgress,
    Alert,
    TextField,
    InputAdornment,
    Slide,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { useAvailableRoles } from '../../../../hooks/useAvailableRoles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../../../hooks/useApi';
import { TransitionProps } from '@mui/material/transitions';

interface RoleAssignModalProps {
    open: boolean;
    onClose: () => void;
    userId: string;
}

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children: React.ReactElement },
    ref: React.Ref<unknown>
) {
    return <Slide direction="left" ref={ref} {...props} />;
});

const RoleAssignModal: React.FC<RoleAssignModalProps> = ({ open, onClose, userId }) => {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<any[]>([]);
    const { data, isLoading, isError } = useAvailableRoles(userId);
    const { put } = useApi();
    const queryClient = useQueryClient();

    const handleToggle = (item: any) => {
        setSelected((prev) => {
            const exists = prev.find(
                (i) => i.role.id === item.role.id && i.project.id === item.project.id
            );
            return exists
                ? prev.filter(
                    (i) => !(i.role.id === item.role.id && i.project.id === item.project.id)
                )
                : [...prev, item];
        });
    };

    const assignRoles = useMutation({
        mutationFn: () => put(`/users/${userId}/role-mappings`, selected),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userRoleMappings', userId] });
            onClose();
        },
        onError: () => alert('역할 할당에 실패했습니다.'),
    });

    return (
        <Dialog
            open={open}
            onClose={onClose}
            TransitionComponent={Transition}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: {
                    width: '50vw',
                    height: '80vh',
                    position: 'fixed',
                    right: 0,
                    m: 0,
                    borderRadius: 0,
                },
            }}
        >
            <DialogTitle>
                역할 할당하기
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" mb={2}>
                    사용자에게 할당하고자 하는 역할을 선택해주세요.
                </Typography>
                <TextField
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    fullWidth
                    placeholder="역할 또는 프로젝트 이름 검색"
                    margin="normal"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                {isLoading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                    </Box>
                ) : isError ? (
                    <Alert severity="error">할당 가능한 역할을 불러오는데 실패했습니다.</Alert>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox"></TableCell>
                                <TableCell>NO</TableCell>
                                <TableCell>역할명</TableCell>
                                <TableCell>유형</TableCell>
                                <TableCell>설명</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data
                                ?.filter(
                                    (item) =>
                                        item.role.name.includes(search) ||
                                        item.project.name.includes(search)
                                )
                                .map((item, idx) => (
                                    <TableRow key={`${item.role.id}-${item.project.id}`}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selected.some(
                                                    (i) =>
                                                        i.role.id === item.role.id &&
                                                        i.project.id === item.project.id
                                                )}
                                                onChange={() => handleToggle(item)}
                                            />
                                        </TableCell>
                                        <TableCell>{idx + 1}</TableCell>
                                        <TableCell>{item.role.name}</TableCell>
                                        <TableCell>{item.project.name}</TableCell>
                                        <TableCell>{item.role.description ?? '-'}</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'flex-start', px: 3, pb: 2 }}>
                <Button onClick={onClose}>취소</Button>
                <Button
                    variant="contained"
                    disabled={selected.length === 0 || assignRoles.isPending}
                    onClick={() => assignRoles.mutate()}
                >
                    저장
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RoleAssignModal;
