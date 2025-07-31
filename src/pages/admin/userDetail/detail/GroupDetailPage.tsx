import React, { useEffect, useState } from 'react';
import {
    Box,
    Tabs,
    Tab,
    Divider,
    Typography,
    CircularProgress,
    Button,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Drawer,
    TextField, Checkbox,
} from '@mui/material';
import {useNavigate, useParams} from 'react-router-dom';
import { useApi } from '../../../../hooks/useApi';

interface Group {
    id: string;
    name: string;
    description: string | null;
    member_count: number;
    created_at: string;
    updated_at: string;
    created_by: string;
}

interface Member {
    id: string;
    username: string;
    email: string;
    joined_at: string;
}

interface User {
    id: string;
    username: string;
    email: string;
    joined_at: string;
    employee_number: string;
    department: string;
}
const GroupDetailPage: React.FC = () => {
    const { groupId } = useParams();
    const { get, post,put,delete: deleteApi } = useApi();

    const [tab, setTab] = useState(0);
    const [groupData, setGroupData] = useState<Group | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const navigate = useNavigate();
    const [addDrawerOpen, setAddDrawerOpen] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const fetchGroup = async () => {
        setLoading(true);
        try {
            const res = await get<Group>(`/groups/${groupId}`);
            setGroupData(res);
            setEditName(res.name);
            setEditDescription(res.description ?? '');
        } catch (err) {
            // alert('그룹 정보를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const res = await get<{
                data: {
                    id: string;
                    username: string;
                    email: string;
                    joined_at: string;
                }[];
            }>(`/groups/${groupId}/user-mappings?page=1&size=100`);

            setMembers(res.data);
        } catch {
            // alert('구성원 정보를 불러오는 데 실패했습니다.');
            setMembers([]);
        }
    };

    const handleEditSubmit = async () => {
        try {
            const encodedName = encodeURIComponent(editName);
            const encodedDesc = encodeURIComponent(editDescription);
            await put(`/groups/${groupId}?group_name=${encodedName}&description=${encodedDesc}`);
            await fetchGroup();           // ✅ 데이터 리로드
            setEditOpen(false);          // ✅ drawer 닫기
        } catch (err) {
            console.error(err);
            alert('수정에 실패했습니다.');
        }
    };

// 1. 그룹 정보와 구성원 정보는 groupId가 처음 들어왔을 때만 호출
    useEffect(() => {
        if (!groupId) return;
        fetchGroup();
        fetchMembers();
    }, [groupId]);

// 2. 구성원 추가 Drawer가 열렸을 때만 후보 유저 로딩
    useEffect(() => {
        const fetchAvailableUsers = async () => {
            if (!addDrawerOpen || !groupId) return;
            try {
                const res = await get<{ data: User[] }>(`/groups/${groupId}/user-available`);
                setAvailableUsers(res.data);
            } catch {
                alert('구성원 후보 정보를 불러오는 데 실패했습니다.');
            }
        };

        fetchAvailableUsers();
    }, [addDrawerOpen, groupId]);

    const toggleUserSelection = (userId: string) => {
        setSelectedUserIds((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    // 3. 저장 클릭 시 API 호출
    const handleAddMembers = async () => {
        if (selectedUserIds.length === 0) {
            alert('구성원을 선택해주세요.');
            return;
        }

        try {
            const queryString = selectedUserIds.map((id) => `user_id=${id}`).join('&');
            await put(`/groups/${groupId}/user-mappings?${queryString}`);
            alert('구성원이 추가되었습니다.');
            setAddDrawerOpen(false);
            setSelectedUserIds([]);
            fetchMembers(); // 구성원 목록 새로고침
        } catch (error) {
            alert('구성원 추가에 실패했습니다.');
            console.error(error);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={10}>
                <CircularProgress />
            </Box>
        );
    }

    if (!groupData) {
        return (
            <Box textAlign="center" mt={10}>
                {/*<Typography variant="h6">그룹 정보를 찾을 수 없습니다.</Typography>*/}
            </Box>
        );
    }



    return (
        <Box>
            <Typography variant="h5" fontWeight={700} mb={1}>그룹 상세</Typography>
            <Typography color="text.secondary" mb={3}>
                그룹의 기본 정보와 그룹에 속한 구성원 정보를 확인하고 관리할 수 있습니다.
            </Typography>

            <Tabs value={tab} onChange={handleTabChange}>
                <Tab label="기본정보" />
                <Tab label="구성원 정보" />
            </Tabs>
            <Divider sx={{ mb: 2 }} />

            {tab === 0 && (
                <Box>
                    <Typography variant="subtitle1" fontWeight={700} mb={1}>기본 정보</Typography>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell>그룹명</TableCell>
                                <TableCell>{groupData.name}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>설명</TableCell>
                                <TableCell>{groupData.description ?? '-'}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>

                    <Typography variant="subtitle1" fontWeight={700} mt={3} mb={1}>등록정보</Typography>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell>생성일시</TableCell>
                                <TableCell>{groupData.created_at}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>최종업데이트 일시</TableCell>
                                <TableCell>{groupData.updated_at}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>생성자</TableCell>
                                <TableCell>{groupData.created_by}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>

                    <Box mt={4} display="flex" justifyContent="center" gap={2}>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={async () => {
                                if (!window.confirm('정말로 삭제하시겠습니까?')) return;
                                try {
                                    await deleteApi(`/groups/${groupId}`);
                                    alert('삭제되었습니다.');
                                    navigate('/admin/groups'); // 목록으로 이동
                                } catch {
                                    alert('삭제에 실패했습니다.');
                                }
                            }}
                        >
                            삭제
                        </Button>
                        <Button variant="contained" onClick={() => setEditOpen(true)}>수정</Button>
                    </Box>
                </Box>
            )}

            {tab === 1 && (
                <Box>
                    <Typography variant="subtitle1" fontWeight={700} mb={2}>구성원 목록</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>No</TableCell>
                                <TableCell>이름</TableCell>
                                <TableCell>인사상태</TableCell>
                                <TableCell>행번</TableCell>
                                <TableCell>부서</TableCell>
                                <TableCell>마지막 접속 일시</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {members.map((member, idx) => (
                                <TableRow key={member.id}>
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell>{member.username}</TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell>{member.joined_at}</TableCell>
                                    <TableCell>{member.joined_at}</TableCell>
                                    <TableCell>{member.joined_at}</TableCell>
                                    <TableCell>{member.joined_at}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Button variant="contained" onClick={() => setAddDrawerOpen(true)} sx={{ mt: 2 }}>
                        구성원 추가하기
                    </Button>
                </Box>
            )}

            <Drawer anchor="right" open={editOpen} onClose={() => setEditOpen(false)} PaperProps={{ sx: { width: 400 } }}>
                <Box p={3}>
                    <Typography variant="h6" mb={2}>그룹 정보 수정</Typography>
                    <TextField
                        fullWidth
                        label="그룹명"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="설명"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        margin="normal"
                    />
                    <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
                        <Button onClick={() => setEditOpen(false)}>취소</Button>
                        <Button variant="contained" onClick={handleEditSubmit}>저장</Button>
                    </Box>
                </Box>
            </Drawer>

            <Drawer
                anchor="right"
                open={addDrawerOpen}
                onClose={() => setAddDrawerOpen(false)}
                PaperProps={{ sx: { width: '50%', top: 40 } }}
            >
                <Box p={3}>
                    <Typography variant="h6" mb={2}>구성원 추가하기</Typography>
                    <Typography variant="body2" mb={2}>
                        플랫폼 내 모든 사용자가 노출됩니다. 구성원을 선택 후 저장하면 그룹에 추가할 수 있습니다.
                    </Typography>

                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox" />
                                <TableCell>NO</TableCell>
                                <TableCell>이름</TableCell>
                                <TableCell>행번</TableCell>
                                <TableCell>부서</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {availableUsers.map((user, index) => (
                                <TableRow key={user.id}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedUserIds.includes(user.id)}
                                            onChange={() => toggleUserSelection(user.id)}
                                        />
                                    </TableCell>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.employee_number ?? '-'}</TableCell>
                                    <TableCell>{user.department ?? '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                        <Button onClick={() => {
                            setAddDrawerOpen(false);
                            setSelectedUserIds([]); // 초기화
                        }}>
                            취소
                        </Button>
                        <Button variant="contained" onClick={handleAddMembers}>
                            저장
                        </Button>
                    </Box>
                </Box>
            </Drawer>
        </Box>
    );
};

export default GroupDetailPage;