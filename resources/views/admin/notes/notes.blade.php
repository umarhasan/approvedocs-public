@extends('admin.layouts.app')

@section('content')




    <!-- Content Wrapper. Contains page content -->
    <div class="content-wrapper">
        <section class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1>Notes</h1>
                    </div>
                    <div class="col-sm-6">
                        <ol class="breadcrumb float-sm-right">
                            <li class="breadcrumb-item"><a href="#">Home</a></li>
                            <li class="breadcrumb-item active">Notes</li>
                        </ol>
                    </div>
                </div>
            </div><!-- /.container-fluid -->
        </section>

        <!-- Main content -->
        <section class="content">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">

                        <div class="card">
                            <!-- /.card-header -->
                            <div class="card-header">
                                <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#myModal">
                                    Add Notes
                                </button>
                                <div class="modal fade" id="myModal">
                                    <div class="modal-dialog">
                                        <div class="modal-content">

                                            <!-- Modal Header -->
                                            <div class="modal-header">
                                                <h4 class="modal-title">Add Notes</h4>
                                                <button type="button" class="close" data-dismiss="modal">&times;</button>
                                            </div>

                                            <!-- Modal body -->
                                            <div class="modal-body">
                                                <form action="{{ route('notes.store') }}" method="POST"
                                                    enctype="multipart/form-data">
                                                    @csrf
                                                    <div class="form-group">
                                                        <label for="title">Title:</label>
                                                        <input type="text" class="form-control" id="title"
                                                            name="title">
                                                    </div>

                                                    <div class="form-group">
                                                        <label for="description">Description:</label>
                                                        <input type="text" class="form-control" id="description"
                                                            name="description">
                                                    </div>

                                                    <div class="form-group">
                                                        <label for="place_id">Place:</label>
                                                        <select class="form-control" id="place_id" name="place_id">
                                                            <option selected hidden>Options</option>
                                                            @foreach ($places as $place)
                                                                <option value="{{ $place->id }}">{{ $place->title }}
                                                                </option>
                                                            @endforeach
                                                        </select>
                                                    </div>

                                                    <div class="form-group">
                                                        <label for="image">Image:</label>
                                                        <input type="file" class="form-control-file" id="image"
                                                            name="image" accept=".jpeg, .jpg, .png, .gif, .bmp, .svg">
                                                    </div>
                                            </div>

                                            <!-- Modal footer -->
                                            <div class="modal-footer">
                                                <button type="button" class="btn btn-secondary"
                                                    data-dismiss="modal">Close</button>
                                                <button type="submit" class="btn btn-primary" id="saveData">Save
                                                    Data</button>
                                            </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="card-body">
                                <table id="example1" class="table table-bordered table-striped  ">
                                    <thead>
                                        <tr>
                                            <th>S.N</th>
                                            <th>Title</th>
                                            <th>Description</th>
                                            <th>Place</th>
                                            <th>Image</th>
                                            {{-- <th>Uploaded</th> --}}

                                        </tr>
                                    </thead>

                                    <tbody>
                                        @if ($notes)
                                            @foreach ($notes as $key => $note)
                                                <tr>
                                                    <td>{{ $key + 1 }}</td>
                                                    <td>{{ $note->title }}</td>
                                                    <td>{{ $note->description }}</td>
                                                    <td>{{ $note->place->title }}</td>
                                                    <td>
                                                        <a href="{{ asset($note->image) ?? '' }}"
                                                            target="blank">{{ basename($note->image) ?? 'null' }}</a>
                                                    </td>
                                                </tr>
                                            @endforeach
                                        @endif
                                    </tbody>
                                </table>

                            </div>
                            <!-- /.card-body -->
                        </div>
                        <!-- /.card -->
                    </div>
                    <!-- /.col -->
                </div>
                <!-- /.row -->
            </div>
            <!-- /.container-fluid -->
        </section>
    </div>
@endsection
