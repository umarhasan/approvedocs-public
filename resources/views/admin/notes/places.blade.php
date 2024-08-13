@extends('admin.layouts.app')

@section('content')




    <!-- Content Wrapper. Contains page content -->
    <div class="content-wrapper">
        <section class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1>Places</h1>
                    </div>
                    <div class="col-sm-6">
                        <ol class="breadcrumb float-sm-right">
                            <li class="breadcrumb-item"><a href="#">Home</a></li>
                            <li class="breadcrumb-item active">Places</li>
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
                                    Add Places
                                </button>
                                <div class="modal fade" id="myModal">
                                    <div class="modal-dialog">
                                        <div class="modal-content">

                                            <!-- Modal Header -->
                                            <div class="modal-header">
                                                <h4 class="modal-title">Add Places</h4>
                                                <button type="button" class="close" data-dismiss="modal">&times;</button>
                                            </div>

                                            <!-- Modal body -->
                                            <div class="modal-body">
                                                <form action="{{ route('place.store') }}" method="POST"
                                                    enctype="multipart/form-data">
                                                    @csrf
                                                    <div class="form-group">
                                                        <label for="title">Title:</label>
                                                        <input type="text" class="form-control" id="title"
                                                            name="title">
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
                                            <th>Image</th>
                                            <th>Uploaded</th>

                                        </tr>
                                    </thead>

                                    <tbody>
                                        @if ($places)
                                            @foreach ($places as $key => $place)
                                                <tr>
                                                    <td>{{ $key + 1 }}</td>
                                                    <td>{{ $place->title }}</td>
                                                    <td>
                                                        @isset($place->image)
                                                            <a href="{{ asset($place->image) }}" target="_blank">image</a>
                                                        @else
                                                            null
                                                        @endisset
                                                    </td>
                                                    <td>
                                                        {{ $place->updated_at->diffforhumans() }}
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
